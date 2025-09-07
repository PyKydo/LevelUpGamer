// Sistema de logging avanzado para debugging y monitoreo
import { CONFIG } from "./config.js";

export class Logger {
  constructor() {
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4,
    };

    this.levelNames = ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

    // Nivel de log actual (configurable)
    this.currentLevel = CONFIG.logging?.level || this.levels.INFO;

    // Habilitar/deshabilitar logging
    this.enabled = CONFIG.logging?.enabled !== false;

    // Colores para consola
    this.colors = {
      ERROR: "#ff4444",
      WARN: "#ffaa00",
      INFO: "#4488ff",
      DEBUG: "#44ff44",
      TRACE: "#888888",
    };
  }

  // Log de error
  error(message, data = null, context = {}) {
    this.log(this.levels.ERROR, message, data, context);
  }

  // Log de advertencia
  warn(message, data = null, context = {}) {
    this.log(this.levels.WARN, message, data, context);
  }

  // Log de información
  info(message, data = null, context = {}) {
    this.log(this.levels.INFO, message, data, context);
  }

  // Log de debug
  debug(message, data = null, context = {}) {
    this.log(this.levels.DEBUG, message, data, context);
  }

  // Log de trace
  trace(message, data = null, context = {}) {
    this.log(this.levels.TRACE, message, data, context);
  }

  // Método principal de logging
  log(level, message, data = null, context = {}) {
    if (!this.enabled || level > this.currentLevel) {
      return;
    }

    const logEntry = this.createLogEntry(level, message, data, context);

    // Log en consola
    this.logToConsole(logEntry);

    // Guardar en storage
    this.saveLog(logEntry);

    // Enviar a servicio externo (si está configurado)
    this.sendToExternalService(logEntry);
  }

  // Crear entrada de log
  createLogEntry(level, message, data, context) {
    return {
      timestamp: new Date().toISOString(),
      level: this.levelNames[level],
      levelNumber: level,
      message: message,
      data: data,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
      },
      stack: this.getStackTrace(),
    };
  }

  // Log en consola con colores
  logToConsole(logEntry) {
    const { level, message, data, context } = logEntry;
    const color = this.colors[level];
    const prefix = `%c[${level}]`;
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();

    const style = `color: ${color}; font-weight: bold;`;
    const fullMessage = `${prefix} ${timestamp} - ${message}`;

    if (data || Object.keys(context).length > 3) {
      // 3 = url, userAgent, sessionId
      console.group(fullMessage);
      console.log("%cMessage:", "font-weight: bold;", message);

      if (data) {
        console.log("%cData:", "font-weight: bold;", data);
      }

      if (Object.keys(context).length > 3) {
        console.log("%cContext:", "font-weight: bold;", context);
      }

      console.groupEnd();
    } else {
      console.log(prefix, style, timestamp, "-", message);
    }
  }

  // Guardar log en localStorage
  saveLog(logEntry) {
    try {
      const logs = this.getLogs();
      logs.push(logEntry);

      // Mantener solo los últimos 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem("levelup_logs", JSON.stringify(logs));
    } catch (error) {
      console.warn("No se pudo guardar el log:", error);
    }
  }

  // Obtener logs guardados
  getLogs() {
    try {
      const logs = localStorage.getItem("levelup_logs");
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      return [];
    }
  }

  // Enviar a servicio externo (ej: analytics, monitoring)
  sendToExternalService(logEntry) {
    // Solo enviar errores y warnings en producción
    if (
      CONFIG.environment === "production" &&
      (logEntry.level === "ERROR" || logEntry.level === "WARN")
    ) {
      // Aquí se implementaría el envío a servicios como:
      // - Google Analytics
      // - Sentry
      // - LogRocket
      // - Custom API

      this.sendToAnalytics(logEntry);
    }
  }

  // Enviar a analytics (ejemplo)
  sendToAnalytics(logEntry) {
    try {
      // Ejemplo con Google Analytics
      if (typeof gtag !== "undefined") {
        gtag("event", "error", {
          error_message: logEntry.message,
          error_level: logEntry.level,
          error_context: JSON.stringify(logEntry.context),
        });
      }
    } catch (error) {
      console.warn("Error enviando a analytics:", error);
    }
  }

  // Obtener stack trace
  getStackTrace() {
    const stack = new Error().stack;
    return stack ? stack.split("\n").slice(2, 5) : [];
  }

  // Obtener ID del usuario actual
  getCurrentUserId() {
    try {
      const user = window.LevelUpGamer?.getStorageItem("user");
      return user?.id || "anonymous";
    } catch (error) {
      return "anonymous";
    }
  }

  // Obtener ID de sesión
  getSessionId() {
    let sessionId = sessionStorage.getItem("levelup_session_id");
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem("levelup_session_id", sessionId);
    }
    return sessionId;
  }

  // Generar ID de sesión
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Filtrar logs por nivel
  filterLogsByLevel(level) {
    const logs = this.getLogs();
    return logs.filter((log) => log.level === level);
  }

  // Filtrar logs por rango de tiempo
  filterLogsByTimeRange(startTime, endTime) {
    const logs = this.getLogs();
    return logs.filter((log) => {
      const logTime = new Date(log.timestamp);
      return logTime >= startTime && logTime <= endTime;
    });
  }

  // Obtener estadísticas de logs
  getLogStats() {
    const logs = this.getLogs();
    const stats = {
      total: logs.length,
      byLevel: {},
      byHour: {},
      errors: 0,
      warnings: 0,
    };

    logs.forEach((log) => {
      // Por nivel
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      // Por hora
      const hour = new Date(log.timestamp).getHours();
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;

      // Contadores específicos
      if (log.level === "ERROR") stats.errors++;
      if (log.level === "WARN") stats.warnings++;
    });

    return stats;
  }

  // Exportar logs
  exportLogs(format = "json") {
    const logs = this.getLogs();

    if (format === "json") {
      return JSON.stringify(logs, null, 2);
    } else if (format === "csv") {
      return this.logsToCSV(logs);
    }

    return logs;
  }

  // Convertir logs a CSV
  logsToCSV(logs) {
    const headers = ["timestamp", "level", "message", "data", "context"];
    const csvRows = [headers.join(",")];

    logs.forEach((log) => {
      const row = [
        log.timestamp,
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        `"${JSON.stringify(log.data || {}).replace(/"/g, '""')}"`,
        `"${JSON.stringify(log.context || {}).replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  // Limpiar logs
  clearLogs() {
    localStorage.removeItem("levelup_logs");
  }

  // Configurar nivel de log
  setLevel(level) {
    if (typeof level === "string") {
      level = this.levels[level.toUpperCase()];
    }

    if (level !== undefined) {
      this.currentLevel = level;
      this.info(`Nivel de log cambiado a: ${this.levelNames[level]}`);
    }
  }

  // Habilitar/deshabilitar logging
  setEnabled(enabled) {
    this.enabled = enabled;
    this.info(`Logging ${enabled ? "habilitado" : "deshabilitado"}`);
  }

  // Crear logger con contexto específico
  createContextualLogger(context) {
    return {
      error: (message, data) => this.error(message, data, context),
      warn: (message, data) => this.warn(message, data, context),
      info: (message, data) => this.info(message, data, context),
      debug: (message, data) => this.debug(message, data, context),
      trace: (message, data) => this.trace(message, data, context),
    };
  }
}

// Instancia singleton
export const logger = new Logger();

// Hacer disponible globalmente
window.Logger = logger;

export default logger;
