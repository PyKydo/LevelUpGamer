// Configuración global de la aplicación
export const CONFIG = {
  // URLs y endpoints
  baseUrl: window.location.origin,
  apiEndpoints: {
    products: "/data/products.json",
    users: "/data/users.json",
    blog: "/data/blog.json",
  },

  // Claves de localStorage
  storageKeys: {
    cart: "levelup_cart",
    user: "levelup_user",
    theme: "levelup_theme",
    preferences: "levelup_preferences",
  },

  // Configuración de validaciones
  validation: {
    email: {
      domains: ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"],
      maxLength: 100,
    },
    password: {
      minLength: 4,
      maxLength: 10,
    },
    run: {
      minLength: 7,
      maxLength: 9,
      pattern: /^[0-9]+$/,
    },
    name: {
      maxLength: 50,
    },
    lastName: {
      maxLength: 100,
    },
    address: {
      maxLength: 300,
    },
    comment: {
      maxLength: 500,
    },
    product: {
      name: { maxLength: 100 },
      description: { maxLength: 500 },
      price: { min: 0 },
      stock: { min: 0 },
    },
  },

  // Configuración de la tienda
  store: {
    currency: "CLP",
    discount: {
      duocEmail: 0.2, // 20% de descuento para emails Duoc
      registeredUser: 0.1, // 10% de descuento para usuarios registrados
    },
    categories: [
      "Juegos de Mesa",
      "Accesorios",
      "Consolas",
      "Computadores Gamers",
      "Sillas Gamers",
      "Mouse",
      "Mousepad",
      "Poleras Personalizadas",
    ],
  },

  // Configuración de UI
  ui: {
    animations: {
      duration: 300,
      easing: "ease-in-out",
    },
    breakpoints: {
      xs: 575.98,
      sm: 767.98,
      md: 991.98,
      lg: 1199.98,
      xl: 1399.98,
    },
  },
};

// Configuración de regiones y comunas de Chile
export const CHILE_LOCATIONS = {
  regions: [
    { id: "arica", name: "Arica y Parinacota" },
    { id: "tarapaca", name: "Tarapacá" },
    { id: "antofagasta", name: "Antofagasta" },
    { id: "atacama", name: "Atacama" },
    { id: "coquimbo", name: "Coquimbo" },
    { id: "valparaiso", name: "Valparaíso" },
    { id: "metropolitana", name: "Metropolitana" },
    { id: "ohiggins", name: "O'Higgins" },
    { id: "maule", name: "Maule" },
    { id: "nuble", name: "Ñuble" },
    { id: "biobio", name: "Biobío" },
    { id: "araucania", name: "La Araucanía" },
    { id: "rios", name: "Los Ríos" },
    { id: "lagos", name: "Los Lagos" },
    { id: "aysen", name: "Aysén" },
    { id: "magallanes", name: "Magallanes" },
  ],

  communes: {
    metropolitana: [
      "Santiago",
      "Las Condes",
      "Providencia",
      "Ñuñoa",
      "Maipú",
      "Puente Alto",
      "La Florida",
      "San Miguel",
      "La Reina",
      "Vitacura",
    ],
    valparaiso: [
      "Valparaíso",
      "Viña del Mar",
      "Concón",
      "Quilpué",
      "Villa Alemana",
    ],
    biobio: ["Concepción", "Talcahuano", "Chiguayante", "San Pedro de la Paz"],
    // Agregar más comunas según necesidad
  },
};

export default CONFIG;
