<template>
  <div class="container mt-5">
    <h2>Quản lý nhân viên</h2>

    <!-- Form thêm/sửa -->
    <form
      @submit.prevent="editing ? updateEmployee() : addEmployee()"
      class="card p-3 mb-4"
    >
      <h5>{{ editing ? "Cập nhật nhân viên" : "Thêm nhân viên mới" }}</h5>

      <div class="mb-3">
        <label class="form-label">Tên</label>
        <input v-model="name" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Số điện thoại</label>
        <input v-model="phone" type="text" class="form-control" required />
      </div>

      <div class="mb-3" v-if="!editing">
        <label class="form-label">Mật khẩu</label>
        <input
          v-model="password"
          type="password"
          class="form-control"
          required
        />
      </div>

      <button type="submit" class="btn btn-success me-2">
        {{ editing ? "Cập nhật" : "Thêm nhân viên" }}
      </button>
      <button
        v-if="editing"
        @click="resetForm"
        type="button"
        class="btn btn-secondary"
      >
        Hủy
      </button>
    </form>

    <!-- Danh sách Admin -->
    <h4>Danh sách Admin</h4>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Tên</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="admin in admins" :key="admin.id">
          <td>{{ admin.name }}</td>
          <td>{{ admin.email }}</td>
          <td>{{ admin.phone }}</td>
          <td>
            <button
              class="btn btn-warning btn-sm me-2"
              @click="editEmployee(admin)"
            >
              Sửa
            </button>
            <button
              class="btn btn-danger btn-sm"
              @click="deleteEmployee(admin.id)"
            >
              Xóa
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Danh sách user -->
    <h4 class="mt-5">Danh sách người dùng</h4>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Tên</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Phân quyền</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
          <td>
            <select
              class="form-select"
              v-model="user.role"
              @change="changeRole(user)"
            >
              <option value="user">Người dùng</option>
              <option value="admin">Admin</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase";

const name = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const admins = ref([]);
const users = ref([]);
const editing = ref(null);

const fetchAdmins = async () => {
  const { data, error } = await supabase
    .from("login")
    .select("id, name, phone, email")
    .eq("role", "admin");
  if (!error) admins.value = data;
};

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("login")
    .select("id, name, phone, email, role")
    .eq("role", "user");
  if (!error) users.value = data;
};

const addEmployee = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        name: name.value,
        phone: phone.value,
        role: "admin",
      },
    },
  });

  if (error) {
    alert("Tạo tài khoản thất bại: " + error.message);
    return;
  }

  const userId = data.user?.id || data.session?.user?.id;
  if (!userId) {
    alert("Không lấy được ID người dùng.");
    return;
  }

  const { error: insertError } = await supabase.from("login").insert([
    {
      id: userId,
      name: name.value,
      phone: phone.value,
      role: "admin",
      email: email.value,
    },
  ]);

  if (insertError) {
    alert("Lưu dữ liệu thất bại: " + insertError.message);
    return;
  }

  alert("Đã thêm nhân viên mới thành công");
  resetForm();
  fetchAdmins();
  fetchUsers();
};

const editEmployee = (admin) => {
  editing.value = admin.id;
  name.value = admin.name;
  email.value = admin.email;
  phone.value = admin.phone;
};

const updateEmployee = async () => {
  const { error } = await supabase
    .from("login")
    .update({ name: name.value, email: email.value, phone: phone.value })
    .eq("id", editing.value);

  if (error) {
    alert("Cập nhật thất bại: " + error.message);
    return;
  }

  alert("Cập nhật thành công");
  resetForm();
  fetchAdmins();
};

const deleteEmployee = async (id) => {
  const confirmed = confirm("Bạn có chắc muốn xóa nhân viên này?");
  if (!confirmed) return;

  const { error } = await supabase.from("login").delete().eq("id", id);
  if (error) {
    alert("Xóa thất bại: " + error.message);
    return;
  }

  alert("Đã xóa nhân viên");
  fetchAdmins();
};

const changeRole = async (user) => {
  const { error } = await supabase
    .from("login")
    .update({ role: user.role })
    .eq("id", user.id);
  if (error) {
    alert("Cập nhật phân quyền thất bại: " + error.message);
    fetchUsers(); 
    return;
  }

  alert(`${user.name} đã được phân quyền thành ${user.role}`);
  fetchAdmins();
  fetchUsers();
};

const resetForm = () => {
  editing.value = null;
  name.value = "";
  email.value = "";
  phone.value = "";
  password.value = "";
};

onMounted(() => {
  fetchAdmins();
  fetchUsers();
});
</script>
