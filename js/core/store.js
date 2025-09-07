// Sistema de gestión de estado global (Redux-like)
import { logger } from "./logger.js";
import { errorHandler } from "./error-handler.js";

export class Store {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = new Map();
    this.middlewares = [];
    this.history = [];
    this.maxHistorySize = 50;

    // Estado inicial
    this.initialState = { ...initialState };

    logger.info("Store inicializado", { initialState });
  }

  // Obtener estado actual
  getState() {
    return { ...this.state };
  }

  // Obtener una parte específica del estado
  getStateSlice(path) {
    return this.getNestedValue(this.state, path);
  }

  // Obtener valor anidado usando notación de puntos
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Dispatch de acciones
  dispatch(action) {
    try {
      logger.debug("Dispatch action", { action });

      // Ejecutar middlewares
      const processedAction = this.runMiddlewares(action);

      // Ejecutar reducer
      const newState = this.reducer(this.state, processedAction);

      // Verificar si el estado cambió
      if (this.hasStateChanged(this.state, newState)) {
        // Guardar en historial
        this.saveToHistory(this.state, processedAction);

        // Actualizar estado
        this.state = newState;

        // Notificar listeners
        this.notifyListeners(processedAction, newState);

        logger.debug("Estado actualizado", {
          action: processedAction.type,
          newState: newState,
        });
      }

      return processedAction;
    } catch (error) {
      errorHandler.handle(error, {
        context: "store_dispatch",
        action: action,
      });
      throw error;
    }
  }

  // Reducer principal
  reducer(state, action) {
    switch (action.type) {
      case "SET_STATE":
        return { ...state, ...action.payload };

      case "UPDATE_USER":
        return {
          ...state,
          user: { ...state.user, ...action.payload },
        };

      case "SET_CART":
        return {
          ...state,
          cart: action.payload,
        };

      case "ADD_TO_CART":
        const existingItem = state.cart.find(
          (item) => item.productId === action.payload.productId
        );

        if (existingItem) {
          return {
            ...state,
            cart: state.cart.map((item) =>
              item.productId === action.payload.productId
                ? { ...item, quantity: item.quantity + action.payload.quantity }
                : item
            ),
          };
        } else {
          return {
            ...state,
            cart: [...state.cart, action.payload],
          };
        }

      case "REMOVE_FROM_CART":
        return {
          ...state,
          cart: state.cart.filter(
            (item) => item.productId !== action.payload.productId
          ),
        };

      case "UPDATE_CART_ITEM":
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.productId === action.payload.productId
              ? { ...item, ...action.payload.updates }
              : item
          ),
        };

      case "CLEAR_CART":
        return {
          ...state,
          cart: [],
        };

      case "SET_PRODUCTS":
        return {
          ...state,
          products: action.payload,
        };

      case "SET_FILTERS":
        return {
          ...state,
          filters: { ...state.filters, ...action.payload },
        };

      case "SET_LOADING":
        return {
          ...state,
          loading: { ...state.loading, ...action.payload },
        };

      case "SET_ERROR":
        return {
          ...state,
          error: action.payload,
        };

      case "CLEAR_ERROR":
        return {
          ...state,
          error: null,
        };

      case "RESET_STATE":
        return { ...this.initialState };

      default:
        logger.warn("Acción no reconocida", { action });
        return state;
    }
  }

  // Suscribirse a cambios de estado
  subscribe(listener, selector = null) {
    const id = this.generateListenerId();

    this.listeners.set(id, {
      listener,
      selector,
      id,
    });

    logger.debug("Listener suscrito", { id, selector });

    // Retornar función de unsubscribe
    return () => {
      this.listeners.delete(id);
      logger.debug("Listener desuscrito", { id });
    };
  }

  // Suscribirse a una parte específica del estado
  subscribeToSlice(path, listener) {
    return this.subscribe(listener, path);
  }

  // Notificar a los listeners
  notifyListeners(action, newState) {
    this.listeners.forEach(({ listener, selector, id }) => {
      try {
        let dataToSend = newState;

        // Si hay selector, enviar solo esa parte del estado
        if (selector) {
          const selectedData = this.getNestedValue(newState, selector);
          const oldSelectedData = this.getNestedValue(
            this.getPreviousState(),
            selector
          );

          // Solo notificar si la parte seleccionada cambió
          if (
            JSON.stringify(selectedData) !== JSON.stringify(oldSelectedData)
          ) {
            dataToSend = selectedData;
          } else {
            return; // No notificar si no cambió
          }
        }

        listener(dataToSend, action);
      } catch (error) {
        errorHandler.handle(error, {
          context: "store_listener",
          listenerId: id,
        });
      }
    });
  }

  // Agregar middleware
  addMiddleware(middleware) {
    this.middlewares.push(middleware);
    logger.info("Middleware agregado", { middleware: middleware.name });
  }

  // Ejecutar middlewares
  runMiddlewares(action) {
    return this.middlewares.reduce((processedAction, middleware) => {
      return middleware(processedAction, this);
    }, action);
  }

  // Verificar si el estado cambió
  hasStateChanged(oldState, newState) {
    return JSON.stringify(oldState) !== JSON.stringify(newState);
  }

  // Guardar en historial
  saveToHistory(state, action) {
    this.history.push({
      state: { ...state },
      action: { ...action },
      timestamp: new Date().toISOString(),
    });

    // Mantener solo el historial reciente
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  // Obtener estado anterior
  getPreviousState() {
    return this.history.length > 0
      ? this.history[this.history.length - 1].state
      : this.initialState;
  }

  // Obtener historial
  getHistory() {
    return [...this.history];
  }

  // Deshacer última acción
  undo() {
    if (this.history.length > 0) {
      const previousEntry = this.history.pop();
      this.state = previousEntry.state;
      this.notifyListeners({ type: "UNDO" }, this.state);
      logger.info("Acción deshecha", { action: previousEntry.action });
      return true;
    }
    return false;
  }

  // Generar ID único para listener
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Acciones helper
  setState(payload) {
    return this.dispatch({ type: "SET_STATE", payload });
  }

  updateUser(userData) {
    return this.dispatch({ type: "UPDATE_USER", payload: userData });
  }

  setCart(cart) {
    return this.dispatch({ type: "SET_CART", payload: cart });
  }

  addToCart(productId, quantity = 1) {
    return this.dispatch({
      type: "ADD_TO_CART",
      payload: { productId, quantity },
    });
  }

  removeFromCart(productId) {
    return this.dispatch({
      type: "REMOVE_FROM_CART",
      payload: { productId },
    });
  }

  updateCartItem(productId, updates) {
    return this.dispatch({
      type: "UPDATE_CART_ITEM",
      payload: { productId, updates },
    });
  }

  clearCart() {
    return this.dispatch({ type: "CLEAR_CART" });
  }

  setProducts(products) {
    return this.dispatch({ type: "SET_PRODUCTS", payload: products });
  }

  setFilters(filters) {
    return this.dispatch({ type: "SET_FILTERS", payload: filters });
  }

  setLoading(loadingState) {
    return this.dispatch({ type: "SET_LOADING", payload: loadingState });
  }

  setError(error) {
    return this.dispatch({ type: "SET_ERROR", payload: error });
  }

  clearError() {
    return this.dispatch({ type: "CLEAR_ERROR" });
  }

  resetState() {
    return this.dispatch({ type: "RESET_STATE" });
  }

  // Persistir estado en localStorage
  persist(key = "levelup_store_state") {
    try {
      localStorage.setItem(key, JSON.stringify(this.state));
      logger.debug("Estado persistido", { key });
    } catch (error) {
      errorHandler.handle(error, { context: "store_persist" });
    }
  }

  // Restaurar estado desde localStorage
  restore(key = "levelup_store_state") {
    try {
      const savedState = localStorage.getItem(key);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.setState(parsedState);
        logger.info("Estado restaurado", { key });
        return true;
      }
    } catch (error) {
      errorHandler.handle(error, { context: "store_restore" });
    }
    return false;
  }

  // Obtener estadísticas del store
  getStats() {
    return {
      stateSize: JSON.stringify(this.state).length,
      listenersCount: this.listeners.size,
      historySize: this.history.length,
      middlewaresCount: this.middlewares.length,
    };
  }
}

// Estado inicial de la aplicación
const initialState = {
  user: null,
  cart: [],
  products: [],
  filters: {
    category: "",
    search: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
  },
  loading: {
    products: false,
    cart: false,
    user: false,
  },
  error: null,
  ui: {
    theme: "dark",
    language: "es",
    sidebarOpen: false,
  },
};

// Instancia singleton del store
export const store = new Store(initialState);

// Hacer disponible globalmente
window.Store = store;

export default store;
