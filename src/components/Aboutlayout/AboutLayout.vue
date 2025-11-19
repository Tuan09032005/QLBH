<template>
  <div class="container py-5">
    <h2 class="text-info mb-4">Giới thiệu nhóm</h2>
    <p class="lead text-muted">
     GVHD:Sir.CAOHUAN,nhóm bao gồm,TuanPham,NguyenCongHao,QuangVinh,LordchiKhang
    </p>

    <hr class="my-4" />

    <h3 class="mt-5 mb-4 text-secondary">Thành viên (Nhân viên Admin)</h3>

    <div class="row">
      <div
        class="col-md-6 col-lg-4 mb-4"
        v-for="admin in admins"
        :key="admin.id"
      >
        <div class="card h-100 shadow-sm border-0">
          <img
            :src="admin.avatar"
            class="card-img-top rounded-top"
            alt="Avatar"
            style="height: 250px; object-fit: cover"
          />
          <div class="card-body text-center">
            <h5 class="card-title mb-1">{{ admin.name }}</h5>
            <p class="text-muted mb-2"> Vai trò: Admin</p>
            <p class="card-text small">
               <strong>Email:</strong> {{ admin.email }}<br />
               <strong>Phone:</strong> {{ admin.phone }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'

const admins = ref([])

const fetchAdmins = async () => {
  const { data, error } = await supabase
    .from("login")
    .select("id, name, phone, role")
    .eq("role", "admin")

  if (!error) {
    const { data: allUsers } = await supabase.auth.admin.listUsers()
    admins.value = data.map((admin) => {
      const user = allUsers.users.find((u) => u.id === admin.id)
      const email = user?.email || 'unknown@example.com'

      return {
        ...admin,
        email,
        
        avatar: `https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/03/28/12/cristiano-ronaldo.jpg?width=1200&height=1200&fit=crop`,
      }
    })
  }
}

onMounted(fetchAdmins)
</script>

<style scoped>
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 15px;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
.card-img-top {
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}
</style>
