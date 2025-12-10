<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { notifyError, notifySuccess } from '@/stores/notifications'

const products = ref([])

const categories = ref([])
const newCategory = ref('')

const form = reactive({
  title: '',
  price: 0,
  category: '',
  description: '',
  image: '',
  rating_rate: 0,
  rating_count: 0,
  quantity: 0
})

const selectedFile = ref(null)
const imagePreview = ref('')

const editId = ref(null)
const isEdit = computed(() => editId.value !== null)

const loadProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    notifyError('Lỗi khi load sản phẩm: ' + (error?.message || error))
    return
  }

  products.value = data

  // compute categories from products
  const catSet = new Set()
  products.value.forEach(p => {
    if (p.category) catSet.add(p.category)
  })
  categories.value = Array.from(catSet)
}

onMounted(loadProducts)

const resetForm = () => {
  form.title = ''
  form.price = 0
  form.category = ''
  form.description = ''
  form.image = ''
  selectedFile.value = null
  imagePreview.value = ''
  form.rating_rate = 0
  form.rating_count = 0
  form.quantity = 0
  editId.value = null
}

const addCategory = () => {
  const v = (newCategory.value || '').trim()
  if (!v) {
    alert('Vui lòng nhập tên danh mục mới')
    return
  }
  if (!categories.value.includes(v)) {
    categories.value.push(v)
  }
  form.category = v
  newCategory.value = ''
}

const addProduct = async () => {
  if (!form.title || !form.category) {
    alert('Vui lòng nhập tiêu đề và danh mục')
    return
  }

  // If a file is selected, upload it to Supabase Storage first
  let imageUrl = form.image || 'https://via.placeholder.com/150'
  if (selectedFile.value) {
    try {
      const bucket = 'product-images'
      const file = selectedFile.value
      const fileName = `${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true })
      if (uploadError) {
        notifyError('Lỗi upload ảnh: ' + (uploadError?.message || uploadError))
      } else {
        const publicRes = await supabase.storage.from(bucket).getPublicUrl(fileName)
        imageUrl = publicRes?.data?.publicUrl || publicRes?.data?.publicURL || publicRes?.publicURL || imageUrl
      }
    } catch (err) {
      notifyError('Lỗi upload: ' + (err?.message || err))
    }
  }

  const newProduct = {
    title: form.title,
    price: form.price,
    category: form.category,
    description: form.description,
    image: imageUrl,
    rating__rate: form.rating_rate,
    rating__count: form.rating_count,
    quantity: form.quantity
  }

  const { error } = await supabase.from('products').insert(newProduct)

  if (error) {
    notifyError('Lỗi khi thêm sản phẩm: ' + (error?.message || error))
  } else {
notifySuccess('✅ Thêm sản phẩm thành công!')
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
  imagePreview.value = product.image || ''
  form.rating_rate = product.rating__rate || 0
  form.rating_count = product.rating__count || 0
  // populate quantity from common keys if present
  form.quantity = (product.quantity !== undefined && product.quantity !== null) ? Number(product.quantity)
    : (product.stock !== undefined && product.stock !== null) ? Number(product.stock)
    : (product.qty !== undefined && product.qty !== null) ? Number(product.qty)
    : (product.rating__count !== undefined ? Number(product.rating__count) : 0)
}

const updateProduct = async () => {
  if (!editId.value) return

  // If a new file is selected, upload and update image URL first
  let imageUrl = form.image || 'https://via.placeholder.com/150'
  if (selectedFile.value) {
    try {
      const bucket = 'product-images'
      const file = selectedFile.value
      const fileName = `${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true })
      if (uploadError) {
        notifyError('Lỗi upload ảnh: ' + (uploadError?.message || uploadError))
      } else {
        const publicRes = await supabase.storage.from(bucket).getPublicUrl(fileName)
        imageUrl = publicRes?.data?.publicUrl || publicRes?.data?.publicURL || publicRes?.publicURL || imageUrl
      }
    } catch (err) {
      notifyError('Lỗi upload: ' + (err?.message || err))
    }
  }

  const { error } = await supabase.from('products')
    .update({
      title: form.title,
      price: form.price,
      category: form.category,
      description: form.description,
      image: imageUrl,
      rating__rate: form.rating_rate,
      rating__count: form.rating_count,
      quantity: form.quantity
    })
    .eq('id', editId.value)

  if (error) {
    notifyError('Lỗi khi cập nhật: ' + (error?.message || error))
  } else {
    notifySuccess('✅ Cập nhật sản phẩm thành công!')
    await loadProducts()
    resetForm()
  }
}

const handleFileChange = (e) => {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  selectedFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const deleteProduct = async (id) => {
  if (confirm('Bạn có chắc muốn xóa?')) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      notifyError('Lỗi khi xóa: ' + (error?.message || error))
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
        <div class="input-group">
          <select v-model="form.category" class="form-select" required>
            <option value="">-- Chọn danh mục --</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
          <input v-model="newCategory" type="text" class="form-control" placeholder="Danh mục mới" />
          <button type="button" class="btn btn-outline-secondary" @click="addCategory">Thêm</button>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">Mô tả</label>
        <textarea v-model="form.description" rows="3" class="form-control"></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Ảnh (file)</label>
        <input @change="handleFileChange" type="file" accept="image/*" class="form-control" />
      </div>
      <div class="mb-3" v-if="imagePreview || form.image">
        <label class="form-label">Xem trước</label>
        <div>
          <img :src="imagePreview || form.image" alt="preview" width="120" />
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">Đánh giá (sao)</label>
        <input v-model.number="form.rating_rate" type="number" class="form-control" min="0" max="5" step="0.1" />
      </div>
      <div class="mb-3">
        <label class="form-label">Số lượng</label>
        <input v-model.number="form.quantity" type="number" class="form-control" min="0" />
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
          <th>Số lượng</th>
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
          <td>{{ (p.quantity !== undefined && p.quantity !== null) ? p.quantity : (p.stock !== undefined ? p.stock : (p.qty !== undefined ? p.qty : (p.rating__count || 0))) }}</td>
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