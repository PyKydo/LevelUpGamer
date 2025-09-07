// Funciones auxiliares y utilidades
import { CONFIG } from "../core/config.js";

export class Helpers {
  // Formateo de precios
  static formatPrice(price, currency = CONFIG.store.currency) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: currency,
    }).format(price);
  }

  // Formateo de fechas
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Intl.DateTimeFormat("es-CL", {
      ...defaultOptions,
      ...options,
    }).format(new Date(date));
  }

  // Generar ID único
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function
  static throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Validar email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar dominio de email
  static isValidEmailDomain(
    email,
    allowedDomains = CONFIG.validation.email.domains
  ) {
    return allowedDomains.some((domain) => email.endsWith(domain));
  }

  // Validar RUN chileno
  static isValidRun(run) {
    const cleanRun = run.replace(/[.-]/g, "");
    const runRegex = /^[0-9]{7,9}$/;
    return runRegex.test(cleanRun);
  }

  // Formatear RUN
  static formatRun(run) {
    const cleanRun = run.replace(/[.-]/g, "");
    if (cleanRun.length <= 7) return cleanRun;

    const body = cleanRun.slice(0, -1);
    const dv = cleanRun.slice(-1);
    return `${body}-${dv}`;
  }

  // Calcular edad
  static calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Verificar si es mayor de edad
  static isAdult(birthDate) {
    return this.calculateAge(birthDate) >= 18;
  }

  // Sanitizar HTML
  static sanitizeHtml(str) {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }

  // Copiar al portapapeles
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }

  // Obtener parámetros de URL
  static getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};

    for (const [key, value] of params) {
      result[key] = value;
    }

    return result;
  }

  // Construir URL con parámetros
  static buildUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl, window.location.origin);

    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.set(key, params[key]);
      }
    });

    return url.toString();
  }

  // Animar scroll suave
  static smoothScrollTo(element, offset = 0) {
    const targetPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    function animation(currentTime) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }

  // Detectar dispositivo móvil
  static isMobile() {
    return window.innerWidth <= CONFIG.ui.breakpoints.md;
  }

  // Obtener breakpoint actual
  static getCurrentBreakpoint() {
    const width = window.innerWidth;

    if (width <= CONFIG.ui.breakpoints.xs) return "xs";
    if (width <= CONFIG.ui.breakpoints.sm) return "sm";
    if (width <= CONFIG.ui.breakpoints.md) return "md";
    if (width <= CONFIG.ui.breakpoints.lg) return "lg";
    return "xl";
  }

  // Lazy loading de imágenes
  static lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  // Mostrar loading spinner
  static showLoading(element) {
    const spinner = document.createElement("div");
    spinner.className = "spinner-border text-primary";
    spinner.setAttribute("role", "status");
    spinner.innerHTML = '<span class="visually-hidden">Cargando...</span>';

    element.innerHTML = "";
    element.appendChild(spinner);
  }

  // Ocultar loading spinner
  static hideLoading(element, content = "") {
    element.innerHTML = content;
  }
}

export default Helpers;
