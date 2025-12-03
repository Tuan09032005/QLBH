<template>
  <div class="container mt-4">
    <h2 class="text-danger">Quản lý đơn hàng</h2>

    <table class="table table-bordered table-hover">
      <thead>
        <tr>
          <th v-for="h in headers" :key="h">{{ h }}</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginatedOrders" :key="row.id">
          <td v-for="h in headers" :key="h">{{ formatValue(row[h]) }}</td>
          <td>
            <button class="btn btn-sm btn-danger" @click="deleteOrder(row.id)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>

    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
        </li>

        <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
          <button class="page-link" @click="changePage(page)">{{ page }}</button>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="changePage(currentPage + 1)">Next</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { notifyError } from '@/stores/notifications'

const orders = ref([])
const currentPage = ref(1)
const itemsPerPage = 10

const loadOrders = async () => {
  const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: true })
  if (error) {
    notifyError('Lỗi khi load đơn hàng: ' + (error?.message || error))
    return
  }
  orders.value = data || []
}

onMounted(loadOrders)

const totalPages = computed(() => Math.max(1, Math.ceil(orders.value.length / itemsPerPage)))
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return orders.value.slice(start, start + itemsPerPage)
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const deleteOrder = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) notifyError('Lỗi khi xóa đơn hàng: ' + (error?.message || error))
  else await loadOrders()
}

const headers = computed(() => {
  if (!orders.value || orders.value.length === 0) return ['id']
  return Object.keys(orders.value[0])
})

const formatValue = (v) => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  return v
}
</script>
