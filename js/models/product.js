// Modelo de Producto
import { BaseModel } from "./base-model.js";
import { VALIDATION_RULES } from "../utils/validations.js";
import { Helpers } from "../utils/helpers.js";
import { CONFIG } from "../core/config.js";

export class Product extends BaseModel {
  constructor(data = {}) {
    super(data, VALIDATION_RULES.product);

    // Campos por defecto
    this.code = this.code || this.generateCode();
    this.stock = this.stock || 0;
    this.criticalStock = this.criticalStock || 5;
    this.price = this.price || 0;
    this.isActive = this.isActive !== undefined ? this.isActive : true;
    this.createdAt = this.createdAt || new Date().toISOString();
    this.updatedAt = this.updatedAt || new Date().toISOString();
  }

  // Getters específicos
  get formattedPrice() {
    return Helpers.formatPrice(this.price);
  }

  get isLowStock() {
    return this.stock <= this.criticalStock;
  }

  get isOutOfStock() {
    return this.stock <= 0;
  }

  get isInStock() {
    return this.stock > 0;
  }

  get stockStatus() {
    if (this.isOutOfStock) return "out_of_stock";
    if (this.isLowStock) return "low_stock";
    return "in_stock";
  }

  get stockStatusText() {
    switch (this.stockStatus) {
      case "out_of_stock":
        return "Sin Stock";
      case "low_stock":
        return "Stock Bajo";
      default:
        return "En Stock";
    }
  }

  get imageUrl() {
    if (this.image) {
      return `img/products/${this.image}`;
    }
    return "img/products/default-product.webp";
  }

  get shortDescription() {
    if (this.description && this.description.length > 100) {
      return this.description.substring(0, 100) + "...";
    }
    return this.description || "";
  }

  get categoryDisplayName() {
    return this.category || "Sin Categoría";
  }

  // Métodos específicos
  updateStock(newStock) {
    const oldStock = this.stock;
    this.stock = Math.max(0, newStock);
    this.updatedAt = new Date().toISOString();
    this.validateField("stock");

    // Log del cambio
    this.log(`Stock actualizado: ${oldStock} → ${this.stock}`);

    return this;
  }

  addStock(quantity) {
    return this.updateStock(this.stock + quantity);
  }

  removeStock(quantity) {
    return this.updateStock(this.stock - quantity);
  }

  updatePrice(newPrice) {
    const oldPrice = this.price;
    this.price = Math.max(0, newPrice);
    this.updatedAt = new Date().toISOString();
    this.validateField("price");

    this.log(`Precio actualizado: ${oldPrice} → ${this.price}`);

    return this;
  }

  updateCriticalStock(newCriticalStock) {
    this.criticalStock = Math.max(0, newCriticalStock);
    this.updatedAt = new Date().toISOString();
    this.validateField("criticalStock");

    return this;
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Cálculo de descuentos
  calculateDiscount(user = null) {
    let discount = 0;

    if (user) {
      // Descuento para usuarios registrados
      discount += CONFIG.store.discount.registeredUser;

      // Descuento adicional para emails Duoc
      if (
        Helpers.isValidEmailDomain(user.email, [
          "@duoc.cl",
          "@profesor.duoc.cl",
        ])
      ) {
        discount += CONFIG.store.discount.duocEmail;
      }
    }

    return Math.min(discount, 0.5); // Máximo 50% de descuento
  }

  getDiscountedPrice(user = null) {
    const discount = this.calculateDiscount(user);
    return this.price * (1 - discount);
  }

  getFormattedDiscountedPrice(user = null) {
    return Helpers.formatPrice(this.getDiscountedPrice(user));
  }

  // Validaciones específicas
  validateStock() {
    return this.validateField("stock");
  }

  validatePrice() {
    return this.validateField("price");
  }

  validateCategory() {
    return this.validateField("category");
  }

  // Verificar disponibilidad
  isAvailable(quantity = 1) {
    return this.isActive && this.stock >= quantity;
  }

  canAddToCart(quantity = 1) {
    return this.isAvailable(quantity);
  }

  // Métodos de utilidad
  toPublicJSON() {
    return {
      code: this.code,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      category: this.category,
      image: this.image,
      isActive: this.isActive,
      stockStatus: this.stockStatus,
      stockStatusText: this.stockStatusText,
    };
  }

  toAdminJSON() {
    return {
      ...this.toPublicJSON(),
      criticalStock: this.criticalStock,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toCartJSON(user = null) {
    return {
      ...this.toPublicJSON(),
      discountedPrice: this.getDiscountedPrice(user),
      formattedDiscountedPrice: this.getFormattedDiscountedPrice(user),
      discount: this.calculateDiscount(user),
    };
  }

  // Generar código único
  generateCode() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 3);
    return `PRD${timestamp}${random}`.toUpperCase();
  }

  // Métodos estáticos
  static createFromForm(formElement) {
    const formData = new FormData(formElement);
    const productData = {};

    for (const [key, value] of formData.entries()) {
      if (key === "price" || key === "stock" || key === "criticalStock") {
        productData[key] = parseFloat(value) || 0;
      } else {
        productData[key] = value;
      }
    }

    return new Product(productData);
  }

  static createFromData(data) {
    return new Product(data);
  }

  // Búsqueda y filtrado
  matchesSearch(searchTerm) {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const searchableText = [
      this.name,
      this.description,
      this.category,
      this.code,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(term);
  }

  matchesCategory(category) {
    if (!category) return true;
    return this.category === category;
  }

  matchesPriceRange(minPrice, maxPrice) {
    if (minPrice !== null && this.price < minPrice) return false;
    if (maxPrice !== null && this.price > maxPrice) return false;
    return true;
  }

  matchesStockFilter(inStockOnly) {
    if (!inStockOnly) return true;
    return this.isInStock;
  }

  // Comparación
  equals(otherProduct) {
    return otherProduct instanceof Product && this.code === otherProduct.code;
  }

  // Clonación específica
  clone() {
    return new Product(this.toJSON());
  }

  // Método para logging específico
  log(message, level = "debug") {
    super.log(`[Product ${this.code}] ${message}`, level);
  }
}

export default Product;
