<template>
  <div class="container mt-4">
    <HeroBanner />
    <!-- <FeaturedCategories :categories="categories" /> -->
    <FeaturedProducts :products="featuredProducts" @goToDetail="goToDetail" @addToCart="addToCart" />
    <!-- <NewestProducts :products="newestProducts" /> -->
    <CategoryBanners />
    <!-- <NewsletterSignup /> -->
  </div>
</template>

<script setup>
import HeroBanner from '../components/HomeLayout/HeroBanner.vue'
import FeaturedCategories from '../components/HomeLayout/FeaturedCategories.vue'
import FeaturedProducts from '../components/HomeLayout/FeaturedProducts.vue'
import NewestProducts from '../components/HomeLayout/NewestProducts.vue'
import NewsletterSignup from '../components/HomeLayout/NewsletterSignup.vue'
import CategoryBanners from '../components/HomeLayout/CategoryBanners.vue'

import { ref, onMounted } from 'vue'
import productsData from '@/assets/products.json'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cart = useCartStore()

const allProducts = ref([])
const categories = ref([])
const featuredProducts = ref([])
const newestProducts = ref([])

onMounted(() => {
  allProducts.value = productsData
  categories.value = [...new Set(productsData.map(p => p.category))]
  featuredProducts.value = productsData.filter(p => p.rating?.rate >= 4.5).slice(0, 4)
  newestProducts.value = [...productsData].slice(-4)
})

const goToDetail = (id) => router.push(`/product/${id}`)
const addToCart = (p) => cart.addToCart(p)
</script>
