<template>
  <div class="container mt-4">
    <h2 class="text-danger">Quản lý đơn hàng</h2>

    <table class="table table-bordered table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Khách hàng</th>
          <th>SĐT</th>
          <th>Địa chỉ</th>
          <th>Sản phẩm</th>
          <th>Tổng tiền</th>
          <th>Ngày tạo</th>
          <th>Thao tác</th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="orders.length === 0">
          <td colspan="8" class="text-center">Không có đơn hàng nào</td>
        </tr>

        <tr v-for="row in orders" :key="row.id">
          <td>{{ row.id }}</td>
          <td>{{ row.full_name }}</td>
          <td>{{ row.phone }}</td>
          <td>{{ row.address }}</td>

          <td>
            <ul class="mb-0">
              <li v-for="(item, i) in (row.items || [])" :key="i">
                {{ item.name }} (x{{ item.quantity }})
              </li>
            </ul>
          </td>

          <td>{{ row.total }} đ</td>
          <td>{{ row.created_at ? new Date(row.created_at).toLocaleString() : '—' }}</td>

          <td>
            <button class="btn btn-sm btn-primary me-2" @click="editOrder(row)">Sửa</button>
            <button class="btn btn-sm btn-danger" @click="deleteOrder(row.id)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- PHÂN TRANG -->
    <nav v-if="totalPages > 1">
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
const totalOrders = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalOrders.value / itemsPerPage)))

// ----- Safe parse items -----
const safeParseItems = (items) => {
  if (!items) return []
  if (Array.isArray(items)) return items
  try { return JSON.parse(items) } catch { return [] }
}

// ----- Load orders (server-side pagination) -----
const loadOrders = async () => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage - 1

  // Lấy tổng số đơn hàng để tính totalPages
  const { count: countResult, error: countError } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })

  if (countError) {
    notifyError('Lỗi khi lấy tổng số đơn hàng: ' + countError.message)
    return
  }
  totalOrders.value = countResult || 0

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('id', { ascending: true })
    .range(start, end)

  if (error) {
    notifyError('Lỗi khi tải đơn hàng: ' + error.message)
    return
  }

  orders.value = (data || []).map(o => ({
    ...o,
    items: safeParseItems(o.items)
  }))

  // Reset currentPage nếu vượt quá totalPages
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value

  console.log("orders loaded:", orders.value.length)
  console.log("currentPage:", currentPage.value)
}

// ----- Change page -----
const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
    loadOrders()
  }
}

// ----- Delete order -----
const deleteOrder = async (id) => {
  if (!confirm("Bạn chắc chắn muốn xóa đơn hàng này?")) return

  const { error } = await supabase.from("orders").delete().eq("id", id)
  if (error) {
    notifyError("Xóa thất bại: " + error.message)
    return
  }

  // Cập nhật danh sách sau khi xóa
  // Nếu đơn hàng cuối cùng trên trang bị xóa, giảm currentPage
  if (orders.value.length === 1 && currentPage.value > 1) {
    currentPage.value -= 1
  }

  loadOrders()
}

// ----- Edit order -----
const editOrder = (row) => {
  alert("Bạn muốn sửa đơn hàng ID: " + row.id)
}

onMounted(loadOrders)
</script>
