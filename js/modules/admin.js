// Módulo de administración
import { apiService } from "../utils/api.js";
import { Helpers } from "../utils/helpers.js";
import { Validator, VALIDATION_RULES } from "../utils/validations.js";
import { CONFIG } from "../core/config.js";

class AdminModule {
  constructor() {
    this.validator = new Validator();
    this.products = [];
    this.users = [];
    this.stats = {};
  }

  async init() {
    try {
      console.log("Inicializando módulo de administración...");

      // Verificar autenticación y permisos
      if (!this.checkAdminAccess()) {
        return;
      }

      // Cargar datos
      await this.loadData();

      // Configurar event listeners
      this.setupEventListeners();

      // Renderizar contenido según la página
      await this.renderContent();

      console.log("Módulo de administración inicializado correctamente");
    } catch (error) {
      console.error("Error inicializando módulo de administración:", error);
    }
  }

  checkAdminAccess() {
    const authModule = window.LevelUpGamer?.modules?.auth;
    if (!authModule || !authModule.isAdmin()) {
      window.LevelUpGamer?.showNotification("Acceso denegado", "error");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
      return false;
    }
    return true;
  }

  async loadData() {
    try {
      // Cargar productos
      this.products = await apiService.getProducts();

      // Cargar usuarios
      this.users = await apiService.getUsers();

      // Cargar estadísticas
      this.stats = await apiService.getProductStats();

      console.log("Datos de administración cargados");
    } catch (error) {
      console.error("Error cargando datos de administración:", error);
    }
  }

  setupEventListeners() {
    // Event listeners para formularios
    document.addEventListener("submit", (e) => {
      if (e.target.matches("#product-form")) {
        e.preventDefault();
        this.handleProductSubmit(e.target);
      }

      if (e.target.matches("#user-form")) {
        e.preventDefault();
        this.handleUserSubmit(e.target);
      }
    });

    // Event listeners para botones de acción
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-edit-product]")) {
        this.editProduct(e.target.getAttribute("data-product-id"));
      }

      if (e.target.matches("[data-delete-product]")) {
        this.deleteProduct(e.target.getAttribute("data-product-id"));
      }

      if (e.target.matches("[data-edit-user]")) {
        this.editUser(e.target.getAttribute("data-user-id"));
      }

      if (e.target.matches("[data-delete-user]")) {
        this.deleteUser(e.target.getAttribute("data-user-id"));
      }

      if (e.target.matches("[data-export-data]")) {
        this.exportData(e.target.getAttribute("data-export-type"));
      }

      if (e.target.matches("[data-import-data]")) {
        this.importData();
      }
    });
  }

  async renderContent() {
    const currentPage = this.getCurrentPage();

    switch (currentPage) {
      case "dashboard":
        await this.renderDashboard();
        break;
      case "products":
        await this.renderProducts();
        break;
      case "users":
        await this.renderUsers();
        break;
      case "product-form":
        await this.renderProductForm();
        break;
      case "user-form":
        await this.renderUserForm();
        break;
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes("products.html")) return "products";
    if (path.includes("users.html")) return "users";
    if (path.includes("product-form.html")) return "product-form";
    if (path.includes("user-form.html")) return "user-form";
    return "dashboard";
  }

  async renderDashboard() {
    const container = document.getElementById("admin-dashboard");
    if (!container) return;

    container.innerHTML = `
      <div class="row g-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="card-title">${this.stats.total}</h4>
                  <p class="card-text">Total Productos</p>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-box display-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="card-title">${this.users.length}</h4>
                  <p class="card-text">Total Usuarios</p>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-people display-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="card-title">${this.stats.lowStock}</h4>
                  <p class="card-text">Stock Bajo</p>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-exclamation-triangle display-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="card-title">${Helpers.formatPrice(this.stats.totalValue)}</h4>
                  <p class="card-text">Valor Total</p>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-currency-dollar display-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5>Productos por Categoría</h5>
            </div>
            <div class="card-body">
              ${this.renderCategoryChart()}
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5>Acciones Rápidas</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <a href="products.html" class="btn btn-primary">
                  <i class="bi bi-box me-2"></i>Gestionar Productos
                </a>
                <a href="users.html" class="btn btn-success">
                  <i class="bi bi-people me-2"></i>Gestionar Usuarios
                </a>
                <button class="btn btn-info" data-export-data="products">
                  <i class="bi bi-download me-2"></i>Exportar Productos
                </button>
                <button class="btn btn-warning" data-export-data="users">
                  <i class="bi bi-download me-2"></i>Exportar Usuarios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCategoryChart() {
    const categories = Object.entries(this.stats.categories);
    if (categories.length === 0) {
      return "<p class="text-muted">No hay datos disponibles</p>";
    }

    return `
      <div class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${categories.map(([category, count]) => {
              const percentage = ((count / this.stats.total) * 100).toFixed(1);
              return `
                <tr>
                  <td>${category}</td>
                  <td>${count}</td>
                  <td>
                    <div class="progress" style="height: 20px;">
                      <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  async renderProducts() {
    const container = document.getElementById("products-container");
    if (!container) return;

    const productsHTML = this.products.map(product => this.createProductRow(product)).join("");

    container.innerHTML = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Gestión de Productos</h5>
          <div>
            <a href="product-form.html" class="btn btn-primary btn-sm">
              <i class="bi bi-plus me-1"></i>Nuevo Producto
            </a>
            <button class="btn btn-info btn-sm" data-export-data="products">
              <i class="bi bi-download me-1"></i>Exportar
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Código</th>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  createProductRow(product) {
    const isLowStock = product.stock <= (product.criticalStock || 5);
    
    return `
      <tr ${isLowStock ? 'class="table-warning"' : ''}>
        <td>${product.code}</td>
        <td>
          <img src="../../img/products/${product.image}" 
               alt="${product.name}" 
               class="rounded" 
               style="width: 50px; height: 50px; object-fit: cover;">
        </td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${Helpers.formatPrice(product.price)}</td>
        <td>
          <span class="badge ${isLowStock ? 'bg-warning' : 'bg-success'}">
            ${product.stock}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-warning me-2" 
                  data-edit-product="${product.code}" 
                  title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger" 
                  data-delete-product="${product.code}" 
                  title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  async renderUsers() {
    const container = document.getElementById("users-container");
    if (!container) return;

    const usersHTML = this.users.map(user => this.createUserRow(user)).join("");

    container.innerHTML = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Gestión de Usuarios</h5>
          <div>
            <a href="user-form.html" class="btn btn-primary btn-sm">
              <i class="bi bi-plus me-1"></i>Nuevo Usuario
            </a>
            <button class="btn btn-info btn-sm" data-export-data="users">
              <i class="bi bi-download me-1"></i>Exportar
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Región</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${usersHTML}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  createUserRow(user) {
    return `
      <tr>
        <td>${user.id}</td>
        <td>${user.name} ${user.lastName}</td>
        <td>${user.email}</td>
        <td>
          <span class="badge ${user.role === 'Administrador' ? 'bg-danger' : 'bg-primary'}">
            ${user.role}
          </span>
        </td>
        <td>${user.region || 'N/A'}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" 
                  data-edit-user="${user.id}" 
                  title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger" 
                  data-delete-user="${user.id}" 
                  title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  async renderProductForm() {
    const container = document.getElementById("product-form-container");
    if (!container) return;

    const productId = Helpers.getUrlParams().id;
    const product = productId ? this.products.find(p => p.code === productId) : null;

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">${product ? 'Editar' : 'Nuevo'} Producto</h5>
        </div>
        <div class="card-body">
          <form id="product-form">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="name" class="form-label">Nombre del Producto *</label>
                <input type="text" class="form-control" id="name" name="name" 
                       value="${product?.name || ''}" required>
              </div>
              <div class="col-md-6">
                <label for="category" class="form-label">Categoría *</label>
                <select class="form-select" id="category" name="category" required>
                  <option value="">Seleccionar categoría</option>
                  ${CONFIG.store.categories.map(cat => 
                    `<option value="${cat}" ${product?.category === cat ? 'selected' : ''}>${cat}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="col-12">
                <label for="description" class="form-label">Descripción</label>
                <textarea class="form-control" id="description" name="description" rows="3">${product?.description || ''}</textarea>
              </div>
              <div class="col-md-4">
                <label for="price" class="form-label">Precio *</label>
                <input type="number" class="form-control" id="price" name="price" 
                       value="${product?.price || ''}" min="0" step="0.01" required>
              </div>
              <div class="col-md-4">
                <label for="stock" class="form-label">Stock *</label>
                <input type="number" class="form-control" id="stock" name="stock" 
                       value="${product?.stock || ''}" min="0" required>
              </div>
              <div class="col-md-4">
                <label for="criticalStock" class="form-label">Stock Crítico</label>
                <input type="number" class="form-control" id="criticalStock" name="criticalStock" 
                       value="${product?.criticalStock || ''}" min="0">
              </div>
              <div class="col-12">
                <label for="image" class="form-label">Imagen</label>
                <input type="file" class="form-control" id="image" name="image" accept="image/*">
                ${product?.image ? `<small class="text-muted">Imagen actual: ${product.image}</small>` : ''}
              </div>
            </div>
            <div class="mt-4">
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-save me-2"></i>${product ? 'Actualizar' : 'Crear'} Producto
              </button>
              <a href="products.html" class="btn btn-secondary ms-2">Cancelar</a>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async renderUserForm() {
    const container = document.getElementById("user-form-container");
    if (!container) return;

    const userId = Helpers.getUrlParams().id;
    const user = userId ? this.users.find(u => u.id == userId) : null;

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">${user ? 'Editar' : 'Nuevo'} Usuario</h5>
        </div>
        <div class="card-body">
          <form id="user-form">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="name" class="form-label">Nombre *</label>
                <input type="text" class="form-control" id="name" name="name" 
                       value="${user?.name || ''}" required>
              </div>
              <div class="col-md-6">
                <label for="lastName" class="form-label">Apellidos *</label>
                <input type="text" class="form-control" id="lastName" name="lastName" 
                       value="${user?.lastName || ''}" required>
              </div>
              <div class="col-md-6">
                <label for="email" class="form-label">Email *</label>
                <input type="email" class="form-control" id="email" name="email" 
                       value="${user?.email || ''}" required>
              </div>
              <div class="col-md-6">
                <label for="run" class="form-label">RUN *</label>
                <input type="text" class="form-control" id="run" name="run" 
                       value="${user?.run || ''}" required>
              </div>
              <div class="col-md-6">
                <label for="role" class="form-label">Rol *</label>
                <select class="form-select" id="role" name="role" required>
                  <option value="">Seleccionar rol</option>
                  <option value="Cliente" ${user?.role === 'Cliente' ? 'selected' : ''}>Cliente</option>
                  <option value="Vendedor" ${user?.role === 'Vendedor' ? 'selected' : ''}>Vendedor</option>
                  <option value="Administrador" ${user?.role === 'Administrador' ? 'selected' : ''}>Administrador</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="birthDate" class="form-label">Fecha de Nacimiento</label>
                <input type="date" class="form-control" id="birthDate" name="birthDate" 
                       value="${user?.birthDate || ''}">
              </div>
              <div class="col-12">
                <label for="address" class="form-label">Dirección *</label>
                <input type="text" class="form-control" id="address" name="address" 
                       value="${user?.address || ''}" required>
              </div>
            </div>
            <div class="mt-4">
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-save me-2"></i>${user ? 'Actualizar' : 'Crear'} Usuario
              </button>
              <a href="users.html" class="btn btn-secondary ms-2">Cancelar</a>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async handleProductSubmit(form) {
    try {
      const formData = this.getFormData(form);
      const isValid = this.validator.validateForm(formData, VALIDATION_RULES.product);

      if (!isValid) {
        this.validator.displayErrors(form);
        return;
      }

      const productId = Helpers.getUrlParams().id;
      
      if (productId) {
        // Actualizar producto existente
        await this.updateProduct(productId, formData);
        window.LevelUpGamer?.showNotification("Producto actualizado correctamente", "success");
      } else {
        // Crear nuevo producto
        await this.createProduct(formData);
        window.LevelUpGamer?.showNotification("Producto creado correctamente", "success");
      }

      setTimeout(() => {
        window.location.href = "products.html";
      }, 1500);
    } catch (error) {
      console.error("Error guardando producto:", error);
      window.LevelUpGamer?.showNotification("Error al guardar producto", "error");
    }
  }

  async handleUserSubmit(form) {
    try {
      const formData = this.getFormData(form);
      const isValid = this.validator.validateForm(formData, VALIDATION_RULES.user);

      if (!isValid) {
        this.validator.displayErrors(form);
        return;
      }

      const userId = Helpers.getUrlParams().id;
      
      if (userId) {
        // Actualizar usuario existente
        await this.updateUser(userId, formData);
        window.LevelUpGamer?.showNotification("Usuario actualizado correctamente", "success");
      } else {
        // Crear nuevo usuario
        await this.createUser(formData);
        window.LevelUpGamer?.showNotification("Usuario creado correctamente", "success");
      }

      setTimeout(() => {
        window.location.href = "users.html";
      }, 1500);
    } catch (error) {
      console.error("Error guardando usuario:", error);
      window.LevelUpGamer?.showNotification("Error al guardar usuario", "error");
    }
  }

  getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    return data;
  }

  async createProduct(productData) {
    const newProduct = {
      code: `PRD${Date.now()}`,
      ...productData,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      criticalStock: productData.criticalStock ? parseInt(productData.criticalStock) : 5,
      image: productData.image || "default-product.webp"
    };

    this.products.push(newProduct);
    // Aquí se guardaría en el servidor real
    console.log("Producto creado:", newProduct);
  }

  async updateProduct(productId, productData) {
    const index = this.products.findIndex(p => p.code === productId);
    if (index !== -1) {
      this.products[index] = {
        ...this.products[index],
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        criticalStock: productData.criticalStock ? parseInt(productData.criticalStock) : 5
      };
    }
  }

  async createUser(userData) {
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    console.log("Usuario creado:", newUser);
  }

  async updateUser(userId, userData) {
    const index = this.users.findIndex(u => u.id == userId);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...userData
      };
    }
  }

  editProduct(productId) {
    window.location.href = `product-form.html?id=${productId}`;
  }

  deleteProduct(productId) {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      this.products = this.products.filter(p => p.code !== productId);
      window.LevelUpGamer?.showNotification("Producto eliminado", "success");
      this.renderProducts();
    }
  }

  editUser(userId) {
    window.location.href = `user-form.html?id=${userId}`;
  }

  deleteUser(userId) {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      this.users = this.users.filter(u => u.id != userId);
      window.LevelUpGamer?.showNotification("Usuario eliminado", "success");
      this.renderUsers();
    }
  }

  async exportData(type) {
    try {
      await apiService.exportData(type);
      window.LevelUpGamer?.showNotification(`Datos de ${type} exportados correctamente`, "success");
    } catch (error) {
      console.error("Error exportando datos:", error);
      window.LevelUpGamer?.showNotification("Error al exportar datos", "error");
    }
  }

  importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        const data = await apiService.importData(file);
        window.LevelUpGamer?.showNotification("Datos importados correctamente", "success");
        console.log("Datos importados:", data);
      } catch (error) {
        console.error("Error importando datos:", error);
        window.LevelUpGamer?.showNotification("Error al importar datos", "error");
      }
    };
    input.click();
  }
}

export default AdminModule;
