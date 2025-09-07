// Sistema centralizado de manejo de errores
import { CONFIG } from "./config.js";

export class ErrorHandler {
  constructor() {
    this.errorTypes = {
      VALIDATION: "validation",
      NETWORK: "network",
      AUTH: "auth",
      PERMISSION: "permission",
      NOT_FOUND: "not_found",
      SERVER: "server",
      UNKNOWN: "unknown",
    };

    this.errorMessages = {
      [this.errorTypes.VALIDATION]: "Error de validación en los datos",
      [this.errorTypes.NETWORK]: "Error de conexión. Verifica tu internet",
      [this.errorTypes.AUTH]: "Error de autenticación",
      [this.errorTypes.PERMISSION]: "No tienes permisos para esta acción",
      [this.errorTypes.NOT_FOUND]: "Recurso no encontrado",
      [this.errorTypes.SERVER]: "Error interno del servidor",
      [this.errorTypes.UNKNOWN]: "Ha ocurrido un error inesperado",
    };
  }

  // Manejar error y determinar tipo
  handle(error, context = {}) {
    const errorInfo = this.analyzeError(error, context);
    this.logError(errorInfo);
    this.showUserNotification(errorInfo);
    return errorInfo;
  }

  // Analizar error y extraer información
  analyzeError(error, context) {
    const errorInfo = {
      type: this.determineErrorType(error),
      message: this.extractMessage(error),
      originalError: error,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Agregar información específica según el tipo
    switch (errorInfo.type) {
      case this.errorTypes.VALIDATION:
        errorInfo.field = context.field;
        errorInfo.validationErrors = context.validationErrors;
        break;
      case this.errorTypes.NETWORK:
        errorInfo.status = error.status || error.statusCode;
        errorInfo.endpoint = context.endpoint;
        break;
      case this.errorTypes.AUTH:
        errorInfo.action = context.action;
        break;
    }

    return errorInfo;
  }

  // Determinar tipo de error
  determineErrorType(error) {
    if (error.name === "ValidationError" || error.validationErrors) {
      return this.errorTypes.VALIDATION;
    }

    if (
      error.name === "NetworkError" ||
      error.status === 0 ||
      !navigator.onLine
    ) {
      return this.errorTypes.NETWORK;
    }

    if (error.status === 401 || error.name === "AuthError") {
      return this.errorTypes.AUTH;
    }

    if (error.status === 403) {
      return this.errorTypes.PERMISSION;
    }

    if (error.status === 404) {
      return this.errorTypes.NOT_FOUND;
    }

    if (error.status >= 500) {
      return this.errorTypes.SERVER;
    }

    return this.errorTypes.UNKNOWN;
  }

  // Extraer mensaje de error
  extractMessage(error) {
    if (error.message) {
      return error.message;
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.validationErrors) {
      return this.errorMessages[this.errorTypes.VALIDATION];
    }

    return this.errorMessages[this.determineErrorType(error)];
  }

  // Log del error para debugging
  logError(errorInfo) {
    const logData = {
      type: errorInfo.type,
      message: errorInfo.message,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp,
      url: errorInfo.url,
    };

    // Log en consola en desarrollo
    if (CONFIG.environment === "development") {
      console.group(`🚨 Error: ${errorInfo.type}`);
      console.error("Message:", errorInfo.message);
      console.error("Context:", errorInfo.context);
      console.error("Original Error:", errorInfo.originalError);
      console.groupEnd();
    }

    // Guardar en localStorage para debugging
    this.saveErrorLog(logData);
  }

  // Guardar log de errores
  saveErrorLog(logData) {
    try {
      const logs = this.getErrorLogs();
      logs.push(logData);

      // Mantener solo los últimos 50 errores
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }

      localStorage.setItem("levelup_error_logs", JSON.stringify(logs));
    } catch (error) {
      console.warn("No se pudo guardar el log de errores:", error);
    }
  }

  // Obtener logs de errores
  getErrorLogs() {
    try {
      const logs = localStorage.getItem("levelup_error_logs");
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      return [];
    }
  }

  // Mostrar notificación al usuario
  showUserNotification(errorInfo) {
    const message = this.getUserFriendlyMessage(errorInfo);
    const type = this.getNotificationType(errorInfo.type);

    // Usar el sistema de notificaciones existente
    if (window.LevelUpGamer?.showNotification) {
      window.LevelUpGamer.showNotification(message, type);
    } else {
      // Fallback a alert si no hay sistema de notificaciones
      alert(message);
    }
  }

  // Obtener mensaje amigable para el usuario
  getUserFriendlyMessage(errorInfo) {
    switch (errorInfo.type) {
      case this.errorTypes.VALIDATION:
        if (errorInfo.validationErrors) {
          return `Error de validación: ${errorInfo.validationErrors.join(
            ", "
          )}`;
        }
        return "Por favor, revisa los datos ingresados";

      case this.errorTypes.NETWORK:
        return "Error de conexión. Verifica tu conexión a internet e intenta nuevamente";

      case this.errorTypes.AUTH:
        return "Sesión expirada. Por favor, inicia sesión nuevamente";

      case this.errorTypes.PERMISSION:
        return "No tienes permisos para realizar esta acción";

      case this.errorTypes.NOT_FOUND:
        return "El recurso solicitado no fue encontrado";

      case this.errorTypes.SERVER:
        return "Error del servidor. Intenta nuevamente en unos minutos";

      default:
        return "Ha ocurrido un error inesperado. Intenta nuevamente";
    }
  }

  // Obtener tipo de notificación
  getNotificationType(errorType) {
    switch (errorType) {
      case this.errorTypes.VALIDATION:
        return "warning";
      case this.errorTypes.AUTH:
      case this.errorTypes.PERMISSION:
        return "error";
      case this.errorTypes.NETWORK:
      case this.errorTypes.SERVER:
        return "error";
      default:
        return "error";
    }
  }

  // Limpiar logs de errores
  clearErrorLogs() {
    localStorage.removeItem("levelup_error_logs");
  }

  // Obtener estadísticas de errores
  getErrorStats() {
    const logs = this.getErrorLogs();
    const stats = {};

    logs.forEach((log) => {
      stats[log.type] = (stats[log.type] || 0) + 1;
    });

    return {
      total: logs.length,
      byType: stats,
      lastError: logs[logs.length - 1],
    };
  }

  // Crear errores personalizados
  createError(type, message, context = {}) {
    const error = new Error(message);
    error.name = this.getErrorName(type);
    error.type = type;
    error.context = context;
    return error;
  }

  // Obtener nombre del error
  getErrorName(type) {
    const names = {
      [this.errorTypes.VALIDATION]: "ValidationError",
      [this.errorTypes.NETWORK]: "NetworkError",
      [this.errorTypes.AUTH]: "AuthError",
      [this.errorTypes.PERMISSION]: "PermissionError",
      [this.errorTypes.NOT_FOUND]: "NotFoundError",
      [this.errorTypes.SERVER]: "ServerError",
      [this.errorTypes.UNKNOWN]: "UnknownError",
    };

    return names[type] || "UnknownError";
  }

  // Wrapper para funciones async
  async wrapAsync(fn, context = {}) {
    try {
      return await fn();
    } catch (error) {
      return this.handle(error, context);
    }
  }

  // Wrapper para funciones síncronas
  wrapSync(fn, context = {}) {
    try {
      return fn();
    } catch (error) {
      return this.handle(error, context);
    }
  }
}

// Instancia singleton
export const errorHandler = new ErrorHandler();

// Hacer disponible globalmente
window.ErrorHandler = errorHandler;

export default errorHandler;
