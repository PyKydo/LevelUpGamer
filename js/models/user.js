// Modelo de Usuario
import { BaseModel } from "./base-model.js";
import { VALIDATION_RULES } from "../utils/validations.js";
import { Helpers } from "../utils/helpers.js";

export class User extends BaseModel {
  constructor(data = {}) {
    super(data, VALIDATION_RULES.user);

    // Campos por defecto
    this.id = this.id || null;
    this.role = this.role || "Cliente";
    this.createdAt = this.createdAt || new Date().toISOString();
    this.isActive = this.isActive !== undefined ? this.isActive : true;
  }

  // Getters específicos
  get fullName() {
    return `${this.name || ""} ${this.lastName || ""}`.trim();
  }

  get formattedRun() {
    return Helpers.formatRun(this.run || "");
  }

  get age() {
    if (this.birthDate) {
      return Helpers.calculateAge(this.birthDate);
    }
    return null;
  }

  get isAdult() {
    return this.age !== null && this.age >= 18;
  }

  get isAdmin() {
    return this.role === "Administrador";
  }

  get isVendor() {
    return this.role === "Vendedor";
  }

  get isClient() {
    return this.role === "Cliente";
  }

  get hasDuocEmail() {
    return Helpers.isValidEmailDomain(this.email, [
      "@duoc.cl",
      "@profesor.duoc.cl",
    ]);
  }

  get location() {
    if (this.region && this.commune) {
      return `${this.commune}, ${this.region}`;
    }
    return this.address || "";
  }

  // Métodos específicos
  updateProfile(profileData) {
    const allowedFields = [
      "name",
      "lastName",
      "email",
      "address",
      "region",
      "commune",
    ];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    });

    return this.update(updateData);
  }

  changePassword(newPassword) {
    // En una implementación real, aquí se hashearía la contraseña
    this.password = newPassword;
    this.validateField("password");
    return this;
  }

  activate() {
    this.isActive = true;
    return this;
  }

  deactivate() {
    this.isActive = false;
    return this;
  }

  promoteToAdmin() {
    this.role = "Administrador";
    return this;
  }

  demoteToClient() {
    this.role = "Cliente";
    return this;
  }

  // Validaciones específicas
  validateEmail() {
    return this.validateField("email");
  }

  validateRun() {
    return this.validateField("run");
  }

  validateAge() {
    if (this.birthDate) {
      return this.isAdult;
    }
    return true; // Fecha de nacimiento es opcional
  }

  // Métodos de utilidad
  toPublicJSON() {
    const publicData = {
      id: this.id,
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };

    return publicData;
  }

  toAdminJSON() {
    return {
      ...this.toPublicJSON(),
      run: this.run,
      birthDate: this.birthDate,
      address: this.address,
      region: this.region,
      commune: this.commune,
    };
  }

  // Métodos estáticos
  static createFromForm(formElement) {
    const formData = new FormData(formElement);
    const userData = {};

    for (const [key, value] of formData.entries()) {
      userData[key] = value;
    }

    return new User(userData);
  }

  static createAdmin(adminData) {
    return new User({
      ...adminData,
      role: "Administrador",
    });
  }

  static createClient(clientData) {
    return new User({
      ...clientData,
      role: "Cliente",
    });
  }

  static createVendor(vendorData) {
    return new User({
      ...vendorData,
      role: "Vendedor",
    });
  }

  // Comparación
  equals(otherUser) {
    return otherUser instanceof User && this.id === otherUser.id;
  }

  // Clonación específica
  clone() {
    return new User(this.toJSON());
  }
}

export default User;
