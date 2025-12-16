  <template>
    <div class="container mt-5">
      <h2 class="mb-4">Thông tin tài khoản</h2>

      <div v-if="!isLoggedIn" class="card p-4">
        <p>Bạn chưa đăng nhập.</p>
        <div class="d-flex gap-2">
          <router-link to="/login" class="btn btn-brand">Đăng nhập</router-link>
          <router-link to="/register" class="btn btn-outline-brand">Đăng ký</router-link>
        </div>
      </div>

      <div v-else class="row">
        <!-- THÔNG TIN CÁ NHÂN -->
        <div class="col-md-6">
          <div class="card p-4">
            <h5>Thông tin cơ bản</h5>

            <div class="mb-3">
              <label class="form-label">Tên hiển thị</label>
              <input v-model="profile.name" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="profile.email" class="form-control" disabled />
            </div>

            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input v-model="profile.phone" class="form-control" />
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-success" @click="saveProfile">Lưu thay đổi</button>
              <button class="btn btn-secondary" @click="goChangePassword">Đổi mật khẩu</button>
              <button class="btn btn-danger ms-auto" @click="logout">Đăng xuất</button>
            </div>
          </div>
        </div>

        <!-- ĐƠN HÀNG -->
        <div class="col-md-6">
          <div class="card p-4">
            <h5>Đơn hàng của bạn</h5>

            <div v-if="orders.length === 0" class="text-muted">
              Bạn chưa có đơn hàng.
            </div>

            <ul class="list-group">
              <li
                v-for="o in orders"
                :key="o.id"
                class="list-group-item d-flex justify-content-between align-items-start"
              >
                <div>
                  <div class="fw-semibold">Đơn #{{ o.id }}</div>
                  <div class="small text-muted">
                    {{ formatDate(o.created_at) }} — {{ o.total }} $
                  </div>

                  <!-- ⭐ THÊM TRẠNG THÁI -->
                  <span class="badge mt-1" :class="statusClass(o.status)">
                    {{ statusText(o.status) }}
                  </span>
                </div>

                <router-link
                  :to="`/orders/${o.id}`"
                  class="btn btn-sm btn-outline-brand"
                >
                  Xem
                </router-link>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '@/supabase'

  const router = useRouter()
  const isLoggedIn = ref(false)
  const userId = ref(null)

  const profile = ref({
    id: null,
    name: '',
    email: '',
    phone: ''
  })

  const orders = ref([])

  const loadProfile = async (id) => {
    const { data } = await supabase
      .from('login')
      .select('*')
      .eq('id', id)
      .single()

    if (data) profile.value = { ...data }
  }

  const loadOrders = async (id) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('id', { ascending: false })

    if (data) orders.value = data
  }

  onMounted(async () => {
    const u = JSON.parse(localStorage.getItem('user')) || {}
    if (u?.isLoggedIn && u.id) {
      isLoggedIn.value = true
      userId.value = u.id
      await loadProfile(u.id)
      await loadOrders(u.id)
    }
  })

  const saveProfile = async () => {
    const { error } = await supabase
      .from('login')
      .update({
        name: profile.value.name,
        phone: profile.value.phone
      })
      .eq('id', userId.value)

    if (error) return alert('Lưu thất bại')
    alert('Lưu thông tin thành công')
  }

  const logout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const goChangePassword = () => {
    router.push('/update-password')
  }

  const formatDate = (s) => new Date(s).toLocaleString()

  /* ===== TRẠNG THÁI ===== */
  const statusText = (s) => {
    if (s === 'pending') return 'Chờ xác nhận'
    if (s === 'processing') return 'Chờ xử lý'
    if (s === 'done') return 'Hoàn tất'
    return 'Không rõ'
  }

  const statusClass = (s) => {
    if (s === 'pending') return 'bg-warning text-dark'
    if (s === 'processing') return 'bg-primary'
    if (s === 'done') return 'bg-success'
    return 'bg-secondary'
  }
  </script>

  <style scoped>
  .card {
    border-radius: 10px;
  }
  </style>
