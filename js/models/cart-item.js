// Modelo de Item del Carrito
import { BaseModel } from "./base-model.js";
import { Product } from "./product.js";

export class CartItem extends BaseModel {
  constructor(data = {}) {
    // Reglas de validación específicas para items del carrito
    const validationRules = {
      productId: [
        { type: "required", message: "ID del producto es requerido" },
      ],
      quantity: [
        { type: "required", message: "Cantidad es requerida" },
        {
          type: "min",
          params: { min: 1 },
          message: "Cantidad debe ser mayor a 0",
        },
        { type: "integer", message: "Cantidad debe ser un número entero" },
      ],
    };

    super(data, validationRules);

    // Campos por defecto
    this.productId = this.productId || null;
    this.quantity = this.quantity || 1;
    this.addedAt = this.addedAt || new Date().toISOString();
    this.product = this.product || null; // Referencia al producto
  }

  // Getters específicos
  get totalPrice() {
    if (!this.product) return 0;
    return this.product.price * this.quantity;
  }

  get discountedPrice() {
    if (!this.product) return 0;
    return this.product.getDiscountedPrice() * this.quantity;
  }

  get discount() {
    return this.totalPrice - this.discountedPrice;
  }

  get formattedTotalPrice() {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(this.totalPrice);
  }

  get formattedDiscountedPrice() {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(this.discountedPrice);
  }

  get formattedDiscount() {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(this.discount);
  }

  get isAvailable() {
    return this.product && this.product.isAvailable(this.quantity);
  }

  get maxQuantity() {
    return this.product ? this.product.stock : 0;
  }

  get canIncrease() {
    return this.quantity < this.maxQuantity;
  }

  get canDecrease() {
    return this.quantity > 1;
  }

  get productName() {
    return this.product ? this.product.name : "Producto no encontrado";
  }

  get productImage() {
    return this.product
      ? this.product.imageUrl
      : "img/products/default-product.webp";
  }

  get productCategory() {
    return this.product ? this.product.category : "";
  }

  // Métodos específicos
  setProduct(product) {
    if (product instanceof Product) {
      this.product = product;
      this.productId = product.code;

      // Ajustar cantidad si excede el stock disponible
      if (this.quantity > this.maxQuantity) {
        this.quantity = this.maxQuantity;
      }

      this.validateField("productId");
      this.validateField("quantity");
    }
    return this;
  }

  updateQuantity(newQuantity) {
    const oldQuantity = this.quantity;
    this.quantity = Math.max(1, Math.min(newQuantity, this.maxQuantity));

    if (oldQuantity !== this.quantity) {
      this.log(`Cantidad actualizada: ${oldQuantity} → ${this.quantity}`);
    }

    this.validateField("quantity");
    return this;
  }

  increaseQuantity(amount = 1) {
    return this.updateQuantity(this.quantity + amount);
  }

  decreaseQuantity(amount = 1) {
    return this.updateQuantity(this.quantity - amount);
  }

  // Validaciones específicas
  validateQuantity() {
    if (!this.product) {
      this.errors.quantity = ["Producto no encontrado"];
      this.isValid = false;
      return false;
    }

    if (this.quantity > this.maxQuantity) {
      this.errors.quantity = [
        `Cantidad no puede exceder el stock disponible (${this.maxQuantity})`,
      ];
      this.isValid = false;
      return false;
    }

    return this.validateField("quantity");
  }

  validateProduct() {
    if (!this.product) {
      this.errors.productId = ["Producto no encontrado"];
      this.isValid = false;
      return false;
    }

    if (!this.product.isActive) {
      this.errors.productId = ["Producto no está disponible"];
      this.isValid = false;
      return false;
    }

    return true;
  }

  // Métodos de utilidad
  toJSON() {
    return {
      productId: this.productId,
      quantity: this.quantity,
      addedAt: this.addedAt,
    };
  }

  toDisplayJSON() {
    return {
      ...this.toJSON(),
      productName: this.productName,
      productImage: this.productImage,
      productCategory: this.productCategory,
      totalPrice: this.totalPrice,
      discountedPrice: this.discountedPrice,
      discount: this.discount,
      formattedTotalPrice: this.formattedTotalPrice,
      formattedDiscountedPrice: this.formattedDiscountedPrice,
      formattedDiscount: this.formattedDiscount,
      isAvailable: this.isAvailable,
      maxQuantity: this.maxQuantity,
      canIncrease: this.canIncrease,
      canDecrease: this.canDecrease,
    };
  }

  // Métodos estáticos
  static createFromProduct(product, quantity = 1) {
    const cartItem = new CartItem({
      productId: product.code,
      quantity: quantity,
    });

    cartItem.setProduct(product);
    return cartItem;
  }

  static createFromData(data, product = null) {
    const cartItem = new CartItem(data);

    if (product) {
      cartItem.setProduct(product);
    }

    return cartItem;
  }

  // Comparación
  equals(otherItem) {
    return (
      otherItem instanceof CartItem && this.productId === otherItem.productId
    );
  }

  // Clonación específica
  clone() {
    const cloned = new CartItem(this.toJSON());
    if (this.product) {
      cloned.setProduct(this.product);
    }
    return cloned;
  }

  // Método para logging específico
  log(message, level = "debug") {
    super.log(`[CartItem ${this.productId}] ${message}`, level);
  }
}

export default CartItem;
