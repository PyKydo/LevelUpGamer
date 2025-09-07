// Modelo base para todos los modelos de datos
import { Validator, VALIDATION_RULES } from "../utils/validations.js";
import { logger } from "../core/logger.js";
import { errorHandler } from "../core/error-handler.js";

export class BaseModel {
  constructor(data = {}, validationRules = {}) {
    this.validator = new Validator();
    this.validationRules = validationRules;
    this.errors = {};
    this.isValid = true;

    // Cargar datos
    this.loadData(data);

    // Validar datos iniciales
    this.validate();
  }

  // Cargar datos en el modelo
  loadData(data) {
    Object.assign(this, data);
    this.originalData = { ...data };
  }

  // Validar el modelo
  validate() {
    this.errors = {};
    this.isValid = true;

    if (Object.keys(this.validationRules).length === 0) {
      return true;
    }

    const formData = this.toJSON();
    const isValid = this.validator.validateForm(formData, this.validationRules);

    if (!isValid) {
      this.errors = this.validator.getAllErrors();
      this.isValid = false;
    }

    return this.isValid;
  }

  // Validar un campo específico
  validateField(fieldName) {
    if (!this.validationRules[fieldName]) {
      return true;
    }

    const isValid = this.validator.validate(
      fieldName,
      this[fieldName],
      this.validationRules[fieldName]
    );

    if (!isValid) {
      this.errors[fieldName] = this.validator.getFieldErrors(fieldName);
    } else {
      delete this.errors[fieldName];
    }

    this.updateValidity();
    return isValid;
  }

  // Actualizar estado de validez
  updateValidity() {
    this.isValid = Object.keys(this.errors).length === 0;
  }

  // Obtener errores de un campo
  getFieldErrors(fieldName) {
    return this.errors[fieldName] || [];
  }

  // Obtener todos los errores
  getAllErrors() {
    return { ...this.errors };
  }

  // Obtener primer error
  getFirstError() {
    const errorFields = Object.keys(this.errors);
    if (errorFields.length > 0) {
      const firstField = errorFields[0];
      const firstError = this.errors[firstField][0];
      return `${firstField}: ${firstError}`;
    }
    return null;
  }

  // Limpiar errores
  clearErrors() {
    this.errors = {};
    this.isValid = true;
  }

  // Convertir a JSON
  toJSON() {
    const json = {};
    Object.keys(this).forEach((key) => {
      if (
        !key.startsWith("_") &&
        key !== "validator" &&
        key !== "validationRules" &&
        key !== "errors" &&
        key !== "isValid" &&
        key !== "originalData"
      ) {
        json[key] = this[key];
      }
    });
    return json;
  }

  // Convertir a objeto plano
  toObject() {
    return this.toJSON();
  }

  // Clonar el modelo
  clone() {
    const clonedData = this.toJSON();
    return new this.constructor(clonedData);
  }

  // Verificar si ha cambiado
  hasChanged() {
    return JSON.stringify(this.toJSON()) !== JSON.stringify(this.originalData);
  }

  // Obtener campos que han cambiado
  getChangedFields() {
    const current = this.toJSON();
    const original = this.originalData;
    const changed = {};

    Object.keys(current).forEach((key) => {
      if (JSON.stringify(current[key]) !== JSON.stringify(original[key])) {
        changed[key] = {
          old: original[key],
          new: current[key],
        };
      }
    });

    return changed;
  }

  // Resetear a datos originales
  reset() {
    this.loadData(this.originalData);
    this.clearErrors();
  }

  // Actualizar datos
  update(data) {
    Object.assign(this, data);
    this.validate();
    return this;
  }

  // Obtener valor de campo con fallback
  get(fieldName, defaultValue = null) {
    return this[fieldName] !== undefined ? this[fieldName] : defaultValue;
  }

  // Establecer valor de campo
  set(fieldName, value) {
    this[fieldName] = value;
    this.validateField(fieldName);
    return this;
  }

  // Verificar si existe un campo
  has(fieldName) {
    return this[fieldName] !== undefined;
  }

  // Eliminar campo
  remove(fieldName) {
    delete this[fieldName];
    delete this.errors[fieldName];
    this.updateValidity();
  }

  // Obtener campos requeridos
  getRequiredFields() {
    return Object.keys(this.validationRules).filter((field) => {
      return this.validationRules[field].some(
        (rule) => rule.type === "required"
      );
    });
  }

  // Verificar si todos los campos requeridos están presentes
  hasRequiredFields() {
    const requiredFields = this.getRequiredFields();
    return requiredFields.every(
      (field) => this.has(field) && this[field] !== ""
    );
  }

  // Obtener campos opcionales
  getOptionalFields() {
    const allFields = Object.keys(this.validationRules);
    const requiredFields = this.getRequiredFields();
    return allFields.filter((field) => !requiredFields.includes(field));
  }

  // Serializar para envío
  serialize() {
    return JSON.stringify(this.toJSON());
  }

  // Deserializar desde string
  static deserialize(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return new this(data);
    } catch (error) {
      errorHandler.handle(error, { context: "model_deserialize" });
      return null;
    }
  }

  // Crear desde datos de formulario
  static fromFormData(formData) {
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    return new this(data);
  }

  // Crear desde elemento de formulario
  static fromForm(formElement) {
    const formData = new FormData(formElement);
    return this.fromFormData(formData);
  }

  // Método estático para validar datos sin crear instancia
  static validateData(data, validationRules) {
    const validator = new Validator();
    return validator.validateForm(data, validationRules);
  }

  // Método para logging
  log(message, level = "debug") {
    logger[level](message, {
      model: this.constructor.name,
      data: this.toJSON(),
      isValid: this.isValid,
      errors: this.errors,
    });
  }

  // Método para debugging
  debug() {
    console.group(`🔍 Model: ${this.constructor.name}`);
    console.log("Data:", this.toJSON());
    console.log("Valid:", this.isValid);
    console.log("Errors:", this.errors);
    console.log("Changed:", this.hasChanged());
    console.log("Changed Fields:", this.getChangedFields());
    console.groupEnd();
  }
}

export default BaseModel;
