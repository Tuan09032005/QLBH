<template>
  <div class="container mt-5">
    <div class="card p-4">
      <div class="d-flex align-items-center mb-3">
        <button class="btn btn-outline-secondary me-3" @click="goBack">← Quay lại</button>
        <h4 class="m-0">Chi tiết đơn hàng #{{ order.id || id }}</h4>
      </div>

      <div v-if="loading" class="text-center py-4">Đang tải...</div>
      <div v-else>
        <div class="mb-3">
          <strong>Ngày tạo:</strong> {{ formatDate(order.created_at) }}
        </div>
        <div class="mb-3">
          <strong>Người nhận:</strong> {{ order.full_name || '-' }}
        </div>
        <div class="mb-3">
          <strong>Số điện thoại:</strong> {{ order.phone || '-' }}
        </div>
        <div class="mb-3">
          <strong>Địa chỉ:</strong> {{ order.address || '-' }}
        </div>
        <div class="mb-3">
          <strong>Tổng tiền:</strong> {{ order.total ? order.total + ' $' : '-' }}
        </div>

        <h5 class="mt-4">Sản phẩm trong đơn</h5>
        <div v-if="items.length === 0" class="text-muted">Không có sản phẩm.</div>
        <ul class="list-group">
          <li v-for="it in items" :key="it.id + '-' + it.title" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div class="fw-semibold">{{ it.title }}</div>
              <div class="small text-muted">ID: {{ it.id }}</div>
            </div>
            <div class="text-end">
              <div>{{ it.quantity }} × {{ it.price }}$</div>
              <div class="fw-semibold">{{ (it.quantity * it.price).toFixed(2) }}$</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const order = ref({})
const items = ref([])
const loading = ref(true)

const loadOrder = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
    if (error) {
      console.error('Load order error', error)
      order.value = {}
      items.value = []
    } else if (data) {
      order.value = data
      try {
        items.value = data.items ? JSON.parse(data.items) : []
      } catch (e) {
        console.warn('Could not parse order items JSON', e)
        items.value = []
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadOrder)

const goBack = () => router.push('/account')

const formatDate = (s) => {
  if (!s) return ''
  return new Date(s).toLocaleString()
}
</script>

<style scoped>
.card { border-radius: 10px }
.list-group-item { display: flex; align-items: center }
</style>
