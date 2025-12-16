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
          <th>Trạng thái</th>
          <th>Ngày tạo</th>
          <th>Thao tác</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="o in orders" :key="o.id">
          <td>{{ o.id }}</td>
          <td>{{ o.full_name }}</td>
          <td>{{ o.phone }}</td>
          <td>{{ o.address }}</td>

          <td>
            <ul>
              <li v-for="(i, idx) in o.items" :key="idx">
                {{ i.title }} (x{{ i.quantity }})
              </li>
            </ul>
          </td>

          <td>{{ o.total }} $</td>

          <!-- Trạng thái hiển thị badge -->
          <td>
            <span class="badge" :class="statusClass(o.status)">
              {{ statusText(o.status) }}
            </span>
          </td>

          <td>{{ formatDate(o.created_at) }}</td>

          <!-- Thao tác: dropdown thay đổi trạng thái + xóa -->
          <td>
            <select v-model="o.status" @change="updateStatus(o.id, o.status)" class="form-select form-select-sm">
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Chờ xử lý</option>
              <option value="done">Hoàn tất</option>
            </select>

            <button class="btn btn-danger btn-sm mt-1" @click="deleteOrder(o.id)">
              Xóa
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { notifyError } from '@/stores/notifications'

const orders = ref([])

// Load danh sách đơn hàng
const loadOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('id', { ascending: false })

  if (error) return notifyError(error.message)

  orders.value = (data || []).map(o => ({
    ...o,
    items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
  }))
}

// Cập nhật trạng thái
const updateStatus = async (id, status) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)

  if (error) return notifyError(error.message)

  loadOrders() // Load lại danh sách để cập nhật
}

// Xóa đơn hàng
const deleteOrder = async (id) => {
  if (!confirm('Xóa đơn hàng?')) return
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) return notifyError(error.message)
  loadOrders()
}

// Format ngày
const formatDate = d => new Date(d).toLocaleString()

// Text trạng thái
const statusText = s =>
  s === 'pending' ? 'Chờ xác nhận'
  : s === 'processing' ? 'Chờ xử lý'
  : s === 'done' ? 'Hoàn tất'
  : 'Không rõ'

// Class trạng thái
const statusClass = s =>
  s === 'pending' ? 'bg-warning text-dark'
  : s === 'processing' ? 'bg-primary'
  : s === 'done' ? 'bg-success'
  : 'bg-secondary'

onMounted(loadOrders)
</script>

<style scoped>
.card {
  border-radius: 10px;
}
.form-select-sm {
  width: 120px;
}
</style>
