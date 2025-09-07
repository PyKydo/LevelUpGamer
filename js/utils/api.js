// Manejo de datos y comunicación con APIs mejorado
import { CONFIG } from "../core/config.js";
import { Helpers } from "./helpers.js";
import { logger } from "../core/logger.js";
import { errorHandler } from "../core/error-handler.js";
import { store } from "../core/store.js";

export class ApiService {
  constructor() {
    this.baseUrl = CONFIG.baseUrl;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.interceptors = {
      request: [],
      response: [],
      error: []
    };
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryCondition: (error) => error.status >= 500
    };
  }

  // Agregar interceptor
  addInterceptor(type, interceptor) {
    if (this.interceptors[type]) {
      this.interceptors[type].push(interceptor);
      logger.debug(`Interceptor ${type} agregado`, { interceptor: interceptor.name });
    }
  }

  // Remover interceptor
  removeInterceptor(type, interceptor) {
    if (this.interceptors[type]) {
      const index = this.interceptors[type].indexOf(interceptor);
      if (index > -1) {
        this.interceptors[type].splice(index, 1);
        logger.debug(`Interceptor ${type} removido`);
      }
    }
  }

  // Ejecutar interceptores de request
  async runRequestInterceptors(config) {
    let processedConfig = { ...config };
    
    for (const interceptor of this.interceptors.request) {
      try {
        processedConfig = await interceptor(processedConfig);
      } catch (error) {
        logger.error('Error en interceptor de request', { error, interceptor: interceptor.name });
        throw error;
      }
    }
    
    return processedConfig;
  }

  // Ejecutar interceptores de response
  async runResponseInterceptors(response) {
    let processedResponse = response;
    
    for (const interceptor of this.interceptors.response) {
      try {
        processedResponse = await interceptor(processedResponse);
      } catch (error) {
        logger.error('Error en interceptor de response', { error, interceptor: interceptor.name });
        throw error;
      }
    }
    
    return processedResponse;
  }

  // Ejecutar interceptores de error
  async runErrorInterceptors(error) {
    let processedError = error;
    
    for (const interceptor of this.interceptors.error) {
      try {
        processedError = await interceptor(processedError);
      } catch (interceptorError) {
        logger.error('Error en interceptor de error', { 
          originalError: error, 
          interceptorError, 
          interceptor: interceptor.name 
        });
        throw interceptorError;
      }
    }
    
    return processedError;
  }

  // Método genérico para hacer peticiones con interceptores y retry
  async request(url, options = {}, retryCount = 0) {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    try {
      // Configuración inicial
      let config = {
        url,
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
        requestId,
        startTime
      };

      // Ejecutar interceptores de request
      config = await this.runRequestInterceptors(config);

      logger.debug('Iniciando petición', { 
        requestId, 
        url: config.url, 
        method: config.method 
      });

      // Realizar petición
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body
      });

      const duration = Date.now() - startTime;

      // Crear objeto de respuesta
      const responseData = {
        requestId,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        duration,
        url: config.url,
        method: config.method
      };

      // Procesar respuesta
      if (!response.ok) {
        const errorData = await response.text();
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = responseData;
        error.data = errorData;
        throw error;
      }

      // Parsear JSON
      const data = await response.json();
      responseData.data = data;

      // Ejecutar interceptores de response
      const processedResponse = await this.runResponseInterceptors(responseData);

      logger.debug('Petición completada', { 
        requestId, 
        status: response.status, 
        duration 
      });

      return processedResponse.data;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Agregar información adicional al error
      error.requestId = requestId;
      error.duration = duration;
      error.url = url;

      logger.error('Error en petición', { 
        requestId, 
        error: error.message, 
        status: error.status, 
        duration 
      });

      // Intentar retry si es necesario
      if (retryCount < this.retryConfig.maxRetries && 
          this.retryConfig.retryCondition(error)) {
        
        const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount);
        logger.info(`Reintentando petición en ${delay}ms`, { requestId, retryCount: retryCount + 1 });
        
        await this.delay(delay);
        return this.request(url, options, retryCount + 1);
      }

      // Ejecutar interceptores de error
      const processedError = await this.runErrorInterceptors(error);
      
      // Manejar error
      errorHandler.handle(processedError, { 
        context: 'api_request', 
        requestId, 
        url, 
        method: options.method || 'GET' 
      });

      throw processedError;
    }
  }

  // Generar ID único para request
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Delay helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Obtener productos
  async getProducts(useCache = true) {
    const cacheKey = "products";

    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const data = await this.request(
        this.baseUrl + CONFIG.apiEndpoints.products
      );

      if (useCache) {
        this.cache.set(cacheKey, {
          data: data.products,
          timestamp: Date.now(),
        });
      }

      return data.products;
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      return [];
    }
  }

  // Obtener producto por ID
  async getProductById(id) {
    const products = await this.getProducts();
    return products.find((product) => product.code === id);
  }

  // Filtrar productos
  async filterProducts(filters = {}) {
    const products = await this.getProducts();

    return products.filter((product) => {
      // Filtro por categoría
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Filtro por precio mínimo
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }

      // Filtro por precio máximo
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }

      // Filtro por búsqueda de texto
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText =
          `${product.name} ${product.description} ${product.category}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por stock
      if (filters.inStock && product.stock <= 0) {
        return false;
      }

      return true;
    });
  }

  // Obtener categorías
  async getCategories() {
    const products = await this.getProducts();
    const categories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return categories.sort();
  }

  // Obtener usuarios (para admin)
  async getUsers() {
    try {
      const data = await this.request(this.baseUrl + CONFIG.apiEndpoints.users);
      return data.users || [];
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      return [];
    }
  }

  // Obtener usuario por ID
  async getUserById(id) {
    const users = await this.getUsers();
    return users.find((user) => user.id === id);
  }

  // Guardar datos en localStorage (simulación de API)
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Error guardando en storage:", error);
      return false;
    }
  }

  // Obtener datos de localStorage
  getFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error obteniendo de storage:", error);
      return null;
    }
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear();
  }

  // Obtener estadísticas de productos
  async getProductStats() {
    const products = await this.getProducts();

    const stats = {
      total: products.length,
      categories: {},
      totalValue: 0,
      lowStock: 0,
    };

    products.forEach((product) => {
      // Contar por categoría
      stats.categories[product.category] =
        (stats.categories[product.category] || 0) + 1;

      // Sumar valor total
      stats.totalValue += product.price * product.stock;

      // Contar stock bajo
      if (product.stock <= (product.criticalStock || 5)) {
        stats.lowStock++;
      }
    });

    return stats;
  }

  // Exportar datos
  async exportData(type = "products") {
    let data;

    switch (type) {
      case "products":
        data = await this.getProducts();
        break;
      case "users":
        data = await this.getUsers();
        break;
      default:
        throw new Error("Tipo de exportación no válido");
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_export_${Helpers.formatDate(new Date()).replace(
      /\s/g,
      "_"
    )}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Importar datos
  async importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error("Error al parsear el archivo JSON"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"));
      };

      reader.readAsText(file);
    });
  }
}

  // Configurar interceptores por defecto
  setupDefaultInterceptors() {
    // Interceptor de request para agregar headers de autenticación
    this.addInterceptor('request', async (config) => {
      const user = store.getStateSlice('user');
      if (user) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${user.token || 'mock-token'}`,
          'X-User-ID': user.id
        };
      }
      return config;
    });

    // Interceptor de request para logging
    this.addInterceptor('request', async (config) => {
      logger.debug('Request interceptor', { 
        url: config.url, 
        method: config.method,
        headers: config.headers 
      });
      return config;
    });

    // Interceptor de response para actualizar estado de loading
    this.addInterceptor('response', async (response) => {
      store.setLoading({ [response.url.split('/').pop()]: false });
      return response;
    });

    // Interceptor de error para manejo de autenticación
    this.addInterceptor('error', async (error) => {
      if (error.status === 401) {
        store.dispatch({ type: 'CLEAR_USER' });
        window.location.href = '/views/auth/login.html';
      }
      return error;
    });
  }

  // Métodos HTTP específicos
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  // Métodos específicos de la aplicación
  async getProducts(useCache = true) {
    const cacheKey = "products";
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        logger.debug('Productos obtenidos del cache');
        return cached.data;
      }
    }

    try {
      store.setLoading({ products: true });
      const data = await this.get(this.baseUrl + CONFIG.apiEndpoints.products);
      
      if (useCache) {
        this.cache.set(cacheKey, {
          data: data.products,
          timestamp: Date.now()
        });
      }
      
      store.setProducts(data.products);
      return data.products;
    } catch (error) {
      store.setLoading({ products: false });
      throw error;
    }
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(product => product.code === id);
  }

  async getUsers() {
    try {
      store.setLoading({ users: true });
      const data = await this.get(this.baseUrl + CONFIG.apiEndpoints.users);
      return data.users || [];
    } catch (error) {
      store.setLoading({ users: false });
      throw error;
    }
  }

  async createUser(userData) {
    return this.post(this.baseUrl + CONFIG.apiEndpoints.users, userData);
  }

  async updateUser(id, userData) {
    return this.put(`${this.baseUrl + CONFIG.apiEndpoints.users}/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`${this.baseUrl + CONFIG.apiEndpoints.users}/${id}`);
  }

  async createProduct(productData) {
    return this.post(this.baseUrl + CONFIG.apiEndpoints.products, productData);
  }

  async updateProduct(id, productData) {
    return this.put(`${this.baseUrl + CONFIG.apiEndpoints.products}/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`${this.baseUrl + CONFIG.apiEndpoints.products}/${id}`);
  }

  // Métodos de utilidad
  clearCache() {
    this.cache.clear();
    logger.info('Cache limpiado');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }

  // Configurar retry
  setRetryConfig(config) {
    this.retryConfig = { ...this.retryConfig, ...config };
    logger.info('Configuración de retry actualizada', this.retryConfig);
  }
}

// Instancia singleton
export const apiService = new ApiService();

// Configurar interceptores por defecto
apiService.setupDefaultInterceptors();

export default apiService;
