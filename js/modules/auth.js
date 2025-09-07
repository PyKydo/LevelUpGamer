// Módulo de autenticación y gestión de usuarios
import { Validator, VALIDATION_RULES } from "../utils/validations.js";
import { Helpers } from "../utils/helpers.js";
import { CONFIG } from "../core/config.js";

class AuthModule {
  constructor() {
    this.validator = new Validator();
    this.currentUser = null;
  }

  async init() {
    try {
      console.log("Inicializando módulo de autenticación...");

      // Cargar usuario actual si existe
      this.loadCurrentUser();

      // Configurar event listeners
      this.setupEventListeners();

      // Configurar formularios de autenticación
      this.setupAuthForms();

      console.log("Módulo de autenticación inicializado correctamente");
    } catch (error) {
      console.error("Error inicializando módulo de autenticación:", error);
    }
  }

  loadCurrentUser() {
    this.currentUser = window.LevelUpGamer?.getStorageItem("user");
    this.updateAuthUI();
  }

  setupEventListeners() {
    // Event listeners para formularios de autenticación
    document.addEventListener("submit", (e) => {
      if (e.target.matches("#login-form")) {
        e.preventDefault();
        this.handleLogin(e.target);
      }

      if (e.target.matches("#register-form")) {
        e.preventDefault();
        this.handleRegister(e.target);
      }

      if (e.target.matches("#contact-form")) {
        e.preventDefault();
        this.handleContact(e.target);
      }
    });

    // Event listeners para logout
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-logout]")) {
        this.handleLogout();
      }
    });

    // Event listeners para validación en tiempo real
    document.addEventListener("input", (e) => {
      if (e.target.matches("[data-validate]")) {
        this.validateField(e.target);
      }
    });
  }

  setupAuthForms() {
    // Configurar formulario de login
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      this.setupFormValidation(loginForm, VALIDATION_RULES.auth);
    }

    // Configurar formulario de registro
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      this.setupFormValidation(registerForm, VALIDATION_RULES.user);
    }

    // Configurar formulario de contacto
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      this.setupFormValidation(contactForm, VALIDATION_RULES.contact);
    }
  }

  setupFormValidation(form, rules) {
    const fields = form.querySelectorAll("[name]");
    fields.forEach((field) => {
      field.setAttribute("data-validate", "true");
    });
  }

  async handleLogin(form) {
    try {
      const formData = this.getFormData(form);
      const isValid = this.validator.validateForm(
        formData,
        VALIDATION_RULES.auth
      );

      if (!isValid) {
        this.validator.displayErrors(form);
        return;
      }

      // Simular autenticación
      const user = await this.authenticateUser(
        formData.email,
        formData.password
      );

      if (user) {
        this.currentUser = user;
        window.LevelUpGamer?.setStorageItem("user", user);
        this.updateAuthUI();
        window.LevelUpGamer?.showNotification(
          "Inicio de sesión exitoso",
          "success"
        );

        // Redirigir según el rol
        setTimeout(() => {
          if (user.role === "Administrador") {
            window.location.href = "../admin/index.html";
          } else {
            window.location.href = "../index.html";
          }
        }, 1500);
      } else {
        window.LevelUpGamer?.showNotification(
          "Credenciales inválidas",
          "error"
        );
      }
    } catch (error) {
      console.error("Error en login:", error);
      window.LevelUpGamer?.showNotification("Error al iniciar sesión", "error");
    }
  }

  async handleRegister(form) {
    try {
      const formData = this.getFormData(form);
      const isValid = this.validator.validateForm(
        formData,
        VALIDATION_RULES.user
      );

      if (!isValid) {
        this.validator.displayErrors(form);
        return;
      }

      // Verificar si el usuario ya existe
      const existingUser = await this.findUserByEmail(formData.email);
      if (existingUser) {
        window.LevelUpGamer?.showNotification(
          "El correo ya está registrado",
          "error"
        );
        return;
      }

      // Crear nuevo usuario
      const newUser = await this.createUser(formData);
      this.currentUser = newUser;
      window.LevelUpGamer?.setStorageItem("user", newUser);
      this.updateAuthUI();

      window.LevelUpGamer?.showNotification("Registro exitoso", "success");

      // Redirigir al home
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    } catch (error) {
      console.error("Error en registro:", error);
      window.LevelUpGamer?.showNotification("Error al registrarse", "error");
    }
  }

  async handleContact(form) {
    try {
      const formData = this.getFormData(form);
      const isValid = this.validator.validateForm(
        formData,
        VALIDATION_RULES.contact
      );

      if (!isValid) {
        this.validator.displayErrors(form);
        return;
      }

      // Simular envío de mensaje
      await this.sendContactMessage(formData);
      form.reset();
      window.LevelUpGamer?.showNotification(
        "Mensaje enviado correctamente",
        "success"
      );
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      window.LevelUpGamer?.showNotification("Error al enviar mensaje", "error");
    }
  }

  validateField(field) {
    const fieldName = field.name;
    const value = field.value;
    let rules = [];

    // Obtener reglas según el tipo de formulario
    const form = field.closest("form");
    if (form.id === "login-form") {
      rules = VALIDATION_RULES.auth[fieldName] || [];
    } else if (form.id === "register-form") {
      rules = VALIDATION_RULES.user[fieldName] || [];
    } else if (form.id === "contact-form") {
      rules = VALIDATION_RULES.contact[fieldName] || [];
    }

    if (rules.length > 0) {
      const isValid = this.validator.validate(fieldName, value, rules);
      this.updateFieldValidation(field, isValid);
    }
  }

  updateFieldValidation(field, isValid) {
    // Limpiar estados anteriores
    field.classList.remove("is-valid", "is-invalid");
    const feedback = field.parentNode.querySelector(
      ".invalid-feedback, .valid-feedback"
    );
    if (feedback) {
      feedback.remove();
    }

    if (isValid) {
      field.classList.add("is-valid");
    } else {
      field.classList.add("is-invalid");
      const errors = this.validator.getFieldErrors(field.name);
      if (errors.length > 0) {
        const feedback = document.createElement("div");
        feedback.className = "invalid-feedback";
        feedback.textContent = errors[0];
        field.parentNode.appendChild(feedback);
      }
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

  async authenticateUser(email, password) {
    // Simular autenticación con usuarios de prueba
    const testUsers = [
      {
        id: 1,
        email: "admin@duoc.cl",
        password: "admin123",
        name: "Administrador",
        lastName: "Sistema",
        role: "Administrador",
        run: "12345678-9",
        birthDate: "1990-01-01",
        address: "Santiago, Chile",
        region: "metropolitana",
        commune: "Santiago",
      },
      {
        id: 2,
        email: "cliente@gmail.com",
        password: "cliente123",
        name: "Juan",
        lastName: "Pérez",
        role: "Cliente",
        run: "87654321-0",
        birthDate: "1995-05-15",
        address: "Valparaíso, Chile",
        region: "valparaiso",
        commune: "Valparaíso",
      },
    ];

    return testUsers.find(
      (user) => user.email === email && user.password === password
    );
  }

  async findUserByEmail(email) {
    // Simular búsqueda de usuario existente
    const users = window.LevelUpGamer?.getStorageItem("users") || [];
    return users.find((user) => user.email === email);
  }

  async createUser(userData) {
    const newUser = {
      id: Date.now(),
      ...userData,
      role: "Cliente",
      createdAt: new Date().toISOString(),
    };

    // Guardar en la lista de usuarios
    const users = window.LevelUpGamer?.getStorageItem("users") || [];
    users.push(newUser);
    window.LevelUpGamer?.setStorageItem("users", users);

    return newUser;
  }

  async sendContactMessage(messageData) {
    // Simular envío de mensaje
    const messages = window.LevelUpGamer?.getStorageItem("messages") || [];
    const newMessage = {
      id: Date.now(),
      ...messageData,
      sentAt: new Date().toISOString(),
      status: "unread",
    };

    messages.push(newMessage);
    window.LevelUpGamer?.setStorageItem("messages", messages);
  }

  handleLogout() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      this.currentUser = null;
      window.LevelUpGamer?.setStorageItem("user", null);
      this.updateAuthUI();
      window.LevelUpGamer?.showNotification("Sesión cerrada", "info");

      // Redirigir al home
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    }
  }

  updateAuthUI() {
    const loginButton = document.querySelector(".login-signup-btn");
    const userMenu = document.querySelector(".user-menu");

    if (this.currentUser) {
      // Usuario autenticado
      if (loginButton) {
        loginButton.style.display = "none";
      }

      if (userMenu) {
        userMenu.style.display = "block";
        const userName = userMenu.querySelector(".user-name");
        if (userName) {
          userName.textContent = `${this.currentUser.name} ${this.currentUser.lastName}`;
        }
      }
    } else {
      // Usuario no autenticado
      if (loginButton) {
        loginButton.style.display = "block";
      }

      if (userMenu) {
        userMenu.style.display = "none";
      }
    }
  }

  // Métodos de utilidad
  isAuthenticated() {
    return this.currentUser !== null;
  }

  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  isAdmin() {
    return this.hasRole("Administrador");
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Método para verificar autenticación en páginas protegidas
  requireAuth(requiredRole = null) {
    if (!this.isAuthenticated()) {
      window.LevelUpGamer?.showNotification(
        "Debes iniciar sesión para acceder",
        "error"
      );
      setTimeout(() => {
        window.location.href = "../auth/login.html";
      }, 2000);
      return false;
    }

    if (requiredRole && !this.hasRole(requiredRole)) {
      window.LevelUpGamer?.showNotification(
        "No tienes permisos para acceder",
        "error"
      );
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
      return false;
    }

    return true;
  }
}

export default AuthModule;
