// Sistema de validaciones unificado
import { CONFIG } from "../core/config.js";
import { Helpers } from "./helpers.js";

export class Validator {
  constructor() {
    this.errors = {};
    this.rules = {};
  }

  // Validar campo individual
  validate(fieldName, value, rules) {
    this.errors[fieldName] = [];

    for (const rule of rules) {
      const result = this.executeRule(rule, value, fieldName);
      if (result !== true) {
        this.errors[fieldName].push(result);
      }
    }

    return this.errors[fieldName].length === 0;
  }

  // Ejecutar regla de validación
  executeRule(rule, value, fieldName) {
    const { type, message, params } = rule;

    switch (type) {
      case "required":
        return this.validateRequired(value) || message;

      case "email":
        return this.validateEmail(value) || message;

      case "emailDomain":
        return this.validateEmailDomain(value, params?.domains) || message;

      case "run":
        return this.validateRun(value) || message;

      case "password":
        return this.validatePassword(value, params) || message;

      case "minLength":
        return this.validateMinLength(value, params?.min) || message;

      case "maxLength":
        return this.validateMaxLength(value, params?.max) || message;

      case "min":
        return this.validateMin(value, params?.min) || message;

      case "max":
        return this.validateMax(value, params?.max) || message;

      case "pattern":
        return this.validatePattern(value, params?.pattern) || message;

      case "age":
        return this.validateAge(value, params?.minAge) || message;

      case "number":
        return this.validateNumber(value) || message;

      case "integer":
        return this.validateInteger(value) || message;

      default:
        return true;
    }
  }

  // Reglas de validación específicas
  validateRequired(value) {
    return (
      value !== null && value !== undefined && value.toString().trim() !== ""
    );
  }

  validateEmail(value) {
    return Helpers.isValidEmail(value);
  }

  validateEmailDomain(value, domains = CONFIG.validation.email.domains) {
    return Helpers.isValidEmailDomain(value, domains);
  }

  validateRun(value) {
    return Helpers.isValidRun(value);
  }

  validatePassword(value, params = {}) {
    const {
      minLength = CONFIG.validation.password.minLength,
      maxLength = CONFIG.validation.password.maxLength,
    } = params;
    return value.length >= minLength && value.length <= maxLength;
  }

  validateMinLength(value, min) {
    return value.toString().length >= min;
  }

  validateMaxLength(value, max) {
    return value.toString().length <= max;
  }

  validateMin(value, min) {
    return parseFloat(value) >= min;
  }

  validateMax(value, max) {
    return parseFloat(value) <= max;
  }

  validatePattern(value, pattern) {
    return pattern.test(value);
  }

  validateAge(value, minAge = 18) {
    return Helpers.isAdult(value);
  }

  validateNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  validateInteger(value) {
    return Number.isInteger(parseFloat(value));
  }

  // Validar formulario completo
  validateForm(formData, validationRules) {
    this.errors = {};
    let isValid = true;

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const fieldValue = formData[fieldName];
      const fieldValid = this.validate(fieldName, fieldValue, rules);

      if (!fieldValid) {
        isValid = false;
      }
    }

    return isValid;
  }

  // Obtener errores de un campo
  getFieldErrors(fieldName) {
    return this.errors[fieldName] || [];
  }

  // Obtener todos los errores
  getAllErrors() {
    return this.errors;
  }

  // Limpiar errores
  clearErrors() {
    this.errors = {};
  }

  // Mostrar errores en el DOM
  displayErrors(formElement) {
    // Limpiar errores anteriores
    formElement.querySelectorAll(".error-message").forEach((el) => el.remove());
    formElement
      .querySelectorAll(".is-invalid")
      .forEach((el) => el.classList.remove("is-invalid"));

    // Mostrar nuevos errores
    for (const [fieldName, errors] of Object.entries(this.errors)) {
      if (errors.length > 0) {
        const field = formElement.querySelector(`[name="${fieldName}"]`);
        if (field) {
          field.classList.add("is-invalid");

          const errorContainer = document.createElement("div");
          errorContainer.className = "error-message text-danger small mt-1";
          errorContainer.innerHTML = errors.join("<br>");

          field.parentNode.appendChild(errorContainer);
        }
      }
    }
  }
}

// Reglas de validación predefinidas
export const VALIDATION_RULES = {
  // Usuario
  user: {
    run: [
      { type: "required", message: "El RUN es requerido" },
      { type: "run", message: "El RUN debe tener entre 7 y 9 dígitos" },
    ],
    name: [
      { type: "required", message: "El nombre es requerido" },
      {
        type: "maxLength",
        params: { max: CONFIG.validation.name.maxLength },
        message: `El nombre no puede exceder ${CONFIG.validation.name.maxLength} caracteres`,
      },
    ],
    lastName: [
      { type: "required", message: "Los apellidos son requeridos" },
      {
        type: "maxLength",
        params: { max: CONFIG.validation.lastName.maxLength },
        message: `Los apellidos no pueden exceder ${CONFIG.validation.lastName.maxLength} caracteres`,
      },
    ],
    email: [
      { type: "required", message: "El correo es requerido" },
      { type: "email", message: "El formato del correo no es válido" },
      {
        type: "emailDomain",
        message:
          "Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com",
      },
      {
        type: "maxLength",
        params: { max: CONFIG.validation.email.maxLength },
        message: `El correo no puede exceder ${CONFIG.validation.email.maxLength} caracteres`,
      },
    ],
    birthDate: [
      {
        type: "age",
        params: { minAge: 18 },
        message: "Debes ser mayor de 18 años",
      },
    ],
    address: [
      { type: "required", message: "La dirección es requerida" },
      {
        type: "maxLength",
        params: { max: CONFIG.validation.address.maxLength },
        message: `La dirección no puede exceder ${CONFIG.validation.address.maxLength} caracteres`,
      },
    ],
  },

  // Autenticación
  auth: {
    email: [
      { type: "required", message: "El correo es requerido" },
      { type: "email", message: "El formato del correo no es válido" },
      {
        type: "emailDomain",
        message:
          "Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com",
      },
      {
        type: "maxLength",
        params: { max: CONFIG.validation.email.maxLength },
        message: `El correo no puede exceder ${CONFIG.validation.email.maxLength} caracteres`,
      },
    ],
    password: [
      { type: "required", message: "La contraseña es requerida" },
      {
        type: "password",
        params: {
          minLength: CONFIG.validation.password.minLength,
          maxLength: CONFIG.validation.password.maxLength,
        },
        message: `La contraseña debe tener entre ${CONFIG.validation.password.minLength} y ${CONFIG.validation.password.maxLength} caracteres`,
      },
    ],
  },

  // Contacto
  contact: {
    name: [
      { type: "required", message: "El nombre es requerido" },
      {
        type: "maxLength",
        params: { max: 100 },
        message: "El nombre no puede exceder 100 caracteres",
      },
    ],
    email: [
      { type: "email", message: "El formato del correo no es válido" },
      {
        type: "emailDomain",
        message:
          "Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com",
      },
      {
        type: "maxLength",
        params: { max: CONFIG.validation.email.maxLength },
        message: `El correo no puede exceder ${CONFIG.validation.email.maxLength} caracteres`,
      },
    ],
    comment: [
      { type: "required", message: "El comentario es requerido" },
      {
        type: "maxLength",
        params: { max: CONFIG.validation.comment.maxLength },
        message: `El comentario no puede exceder ${CONFIG.validation.comment.maxLength} caracteres`,
      },
    ],
  },

  // Producto
  product: {
    name: [
      { type: "required", message: "El nombre del producto es requerido" },
      {
        type: "maxLength",
        params: { max: CONFIG.validation.product.name.maxLength },
        message: `El nombre no puede exceder ${CONFIG.validation.product.name.maxLength} caracteres`,
      },
    ],
    description: [
      {
        type: "maxLength",
        params: { max: CONFIG.validation.product.description.maxLength },
        message: `La descripción no puede exceder ${CONFIG.validation.product.description.maxLength} caracteres`,
      },
    ],
    price: [
      { type: "required", message: "El precio es requerido" },
      { type: "number", message: "El precio debe ser un número válido" },
      {
        type: "min",
        params: { min: CONFIG.validation.product.price.min },
        message: "El precio debe ser mayor o igual a 0",
      },
    ],
    stock: [
      { type: "required", message: "El stock es requerido" },
      { type: "integer", message: "El stock debe ser un número entero" },
      {
        type: "min",
        params: { min: CONFIG.validation.product.stock.min },
        message: "El stock debe ser mayor o igual a 0",
      },
    ],
    criticalStock: [
      {
        type: "integer",
        message: "El stock crítico debe ser un número entero",
      },
      {
        type: "min",
        params: { min: 0 },
        message: "El stock crítico debe ser mayor o igual a 0",
      },
    ],
    category: [{ type: "required", message: "La categoría es requerida" }],
  },
};

export default Validator;
