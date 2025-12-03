<template>
  <div>
    <h2 class="text-danger">Dashboard Admin</h2>
    <p>Chào mừng đến trang quản trị!</p>

    <div class="row mt-4">
      <div class="col-md-4">
        <div class="card text-white bg-brand mb-3">
          <div class="card-body">
            <h5 class="card-title">Sản phẩm</h5>
            <p class="card-text display-6">{{ counts.products }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-white bg-success mb-3">
          <div class="card-body">
            <h5 class="card-title">Đơn hàng</h5>
            <p class="card-text display-6">{{ counts.orders }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-white bg-warning mb-3">
          <div class="card-body">
            <h5 class="card-title">Khách hàng</h5>
            <p class="card-text display-6">{{ counts.customers }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { notifyError } from '@/stores/notifications'

const counts = ref({ products: 0, orders: 0, customers: 0 })

const loadCounts = async () => {
  try {
    const p = await supabase.from('products').select('id', { count: 'exact' })
    const o = await supabase.from('orders').select('id', { count: 'exact' })
    const c = await supabase.from('customers').select('id', { count: 'exact' })
    counts.value.products = p.count || 0
    counts.value.orders = o.count || 0
    counts.value.customers = c.count || 0
  } catch (err) {
    notifyError('Lỗi khi load counts: ' + (err?.message || err))
  }
}

onMounted(loadCounts)
</script>
