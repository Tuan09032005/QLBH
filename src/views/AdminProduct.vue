<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'

const products = ref([])

const form = reactive({
  title: '',
  price: 0,
  category: '',
  description: '',
  image: '',
  rating_rate: 0,
  rating_count: 0
})

const editId = ref(null)
const isEdit = computed(() => editId.value !== null)

const loadProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('Lỗi khi load sản phẩm:', error.message)
    return
  }

  products.value = data
}

onMounted(loadProducts)

const resetForm = () => {
  form.title = ''
  form.price = 0
  form.category = ''
  form.description = ''
  form.image = ''
  form.rating_rate = 0
  form.rating_count = 0
  editId.value = null
}

const addProduct = async () => {
  if (!form.title || !form.category) {
    alert('Vui lòng nhập tiêu đề và danh mục')
    return
  }

  const newProduct = {
    title: form.title,
    price: form.price,
    category: form.category,
    description: form.description,
    image: form.image || 'https://via.placeholder.com/150',
    rating__rate: form.rating_rate,
    rating__count: form.rating_count
  }

  const { error } = await supabase.from('products').insert(newProduct)

  if (error) {
    console.error('Lỗi khi thêm sản phẩm:', error.message)
  } else {
    alert('✅ Thêm sản phẩm thành công!')
    await loadProducts()
    resetForm()
  }
}

const editProduct = (product) => {
  editId.value = product.id
  form.title = product.title
  form.price = product.price
  form.category = product.category
  form.description = product.description || ''
  form.image = product.image
  form.rating_rate = product.rating__rate || 0
  form.rating_count = product.rating__count || 0
}

const updateProduct = async () => {
  if (!editId.value) return

  const { error } = await supabase.from('products')
    .update({
      title: form.title,
      price: form.price,
      category: form.category,
      description: form.description,
      image: form.image || 'https://via.placeholder.com/150',
      rating__rate: form.rating_rate,
      rating__count: form.rating_count
    })
    .eq('id', editId.value)

  if (error) {
    console.error('Lỗi khi cập nhật:', error.message)
  } else {
    alert('✅ Cập nhật sản phẩm thành công!')
    await loadProducts()
    resetForm()
  }
}

const deleteProduct = async (id) => {
  if (confirm('Bạn có chắc muốn xóa?')) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      console.error('Lỗi khi xóa:', error.message)
    } else {
      await loadProducts()
    }
  }
}

// ---------- PHÂN TRANG ----------
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return products.value.slice(start, start + itemsPerPage)
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<template>
  <div class="container mt-4">
    <h2 class="text-danger">Quản lý sản phẩm</h2>

    <form @submit.prevent="isEdit ? updateProduct() : addProduct()" class="mb-4">
      <div class="mb-3">
        <label class="form-label">Tên sản phẩm</label>
        <input v-model="form.title" type="text" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Giá ($)</label>
        <input v-model.number="form.price" type="number" class="form-control" min="0" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Danh mục</label>
        <input v-model="form.category" type="text" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Mô tả</label>
        <textarea v-model="form.description" rows="3" class="form-control"></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">URL ảnh</label>
        <input v-model="form.image" type="text" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Đánh giá (sao)</label>
        <input v-model.number="form.rating_rate" type="number" class="form-control" min="0" max="5" step="0.1" />
      </div>
      <div class="mb-3">
        <label class="form-label">Lượt đánh giá</label>
        <input v-model.number="form.rating_count" type="number" class="form-control" min="0" />
      </div>

      <button type="submit" class="btn btn-danger me-2">
        {{ isEdit ? 'Cập nhật' : 'Thêm sản phẩm' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="resetForm">Làm mới</button>
    </form>

    <table class="table table-bordered table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Giá ($)</th>
          <th>Danh mục</th>
          <th>Mô tả</th>
          <th>Ảnh</th>
          <th>Đánh giá</th>
          <th>Lượt đánh giá</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in paginatedProducts" :key="p.id">
          <td>{{ p.id }}</td>
          <td>{{ p.title }}</td>
          <td>{{ p.price }}</td>
          <td>{{ p.category }}</td>
          <td>{{ p.description }}</td>
          <td><img :src="p.image" alt="" width="50" /></td>
          <td>{{ p.rating__rate }}</td>
          <td>{{ p.rating__count }}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" @click="editProduct(p)">Sửa</button>
            <button class="btn btn-sm btn-danger" @click="deleteProduct(p.id)">Xóa</button>
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
