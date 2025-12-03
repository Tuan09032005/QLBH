import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart') || '[]')
  }),
  actions: {
    addToCart(product) {
      const found = this.items.find(i => i.id === product.id)
      if (found) {
        found.quantity += 1
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
      this.saveCart()
    },
    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id)
      this.saveCart()
    },
    clearCart() {
      this.items = []
      this.saveCart()
    },
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    }
  },
  getters: {
    totalPrice: (state) =>
      state.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }
})
