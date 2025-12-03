<template>
  <div class="login-wrapper">
    <div class="login-container">
      <!-- Form Section -->
      <div class="login-card">
        <div class="login-header text-center mb-5">
          <h1 class="fw-bold mb-2">Đăng Nhập</h1>
          <p class="text-muted">Chào mừng quay lại SPORTY7</p>
        </div>

        <form @submit.prevent="login">
          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="form-label fw-semibold">Email</label>
            <input
              type="email"
              class="form-control form-control-lg login-input"
              id="email"
              placeholder="Nhập địa chỉ email của bạn"
              v-model="email"
              required
            />
          </div>

          <!-- Password -->
          <div class="mb-4">
            <label for="password" class="form-label fw-semibold">Mật khẩu</label>
            <div class="position-relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                class="form-control form-control-lg login-input"
                id="password"
                placeholder="Nhập mật khẩu của bạn"
                v-model="password"
                required
              />
              <i
                class="bi toggle-password"
                :class="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"
                @click="togglePasswordVisibility"
              ></i>
            </div>
          </div>

          <!-- Forgot Password -->
          <div class="text-end mb-4">
            <router-link
              to="/forgot-password"
              class="text-decoration-none fw-semibold text-brand"
            >
              Quên mật khẩu?
            </router-link>
          </div>

          <!-- Submit Button -->
          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-danger btn-lg fw-semibold">
              Đăng Nhập
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="divider my-4"><span>hoặc</span></div>

        <!-- Register Link -->
        <p class="text-center text-muted">
          Chưa có tài khoản?
          <router-link to="/register" class="text-danger fw-semibold text-decoration-none">
            Đăng ký ngay
          </router-link>
        </p>
      </div>

      <!-- Benefits Section -->
      <div class="login-side" style="display: none;">
        <div class="side-content">
          <h3 class="fw-bold text-white mb-4">Lợi ích khi đăng nhập</h3>
          <ul class="list-unstyled">
            <li class="mb-3 d-flex align-items-start">
              <i class="bi bi-check-circle-fill text-success me-3 mt-1"></i>
              <span>Quản lý đơn hàng và lịch sử mua hàng</span>
            </li>
            <li class="mb-3 d-flex align-items-start">
              <i class="bi bi-check-circle-fill text-success me-3 mt-1"></i>
              <span>Lưu địa chỉ giao hàng ưa thích</span>
            </li>
            <li class="mb-3 d-flex align-items-start">
              <i class="bi bi-check-circle-fill text-success me-3 mt-1"></i>
              <span>Nhận khuyến mãi và ưu đãi độc quyền</span>
            </li>
            <li class="mb-3 d-flex align-items-start">
              <i class="bi bi-check-circle-fill text-success me-3 mt-1"></i>
              <span>Thanh toán nhanh hơn</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";
import { notifyError, notifyWarn, notifySuccess } from '@/stores/notifications'

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const router = useRouter();

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const login = async () => {
  if (!email.value || !password.value) {
    notifyError("Vui lòng nhập email và mật khẩu.");
    return;
  }

  // Đăng nhập với email + password
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    notifyError("Đăng nhập thất bại: " + (error?.message || error));
    return;
  }

  // Refetch lại user để cập nhật trạng thái xác minh email
  const { data: freshUser, error: userError } = await supabase.auth.getUser();

  if (userError || !freshUser.user) {
    notifyError("Không thể lấy thông tin người dùng.");
    return;
  }

  const user = freshUser.user;

  if (!user.email_confirmed_at) {
    notifyWarn("Email của bạn chưa được xác minh. Vui lòng kiểm tra hộp thư đến.");
    return;
  }

  const userId = user.id;

  // Kiểm tra hoặc tạo profile trong bảng login
  let { data: profile, error: profileError } = await supabase
    .from("login")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError && profileError.code === "PGRST116") {
    const insert = await supabase.from("login").insert([
      {
        id: userId,
        name: user.user_metadata?.name || "Người dùng",
        phone: user.user_metadata?.phone || "",
        role: user.user_metadata?.role || "user",
        email: user.email,
      },
    ]);

    if (insert.error) {
      alert("Không thể tạo hồ sơ.");
      return;
    }

    profile = insert.data[0];
  } else if (profileError) {
    alert("Không thể lấy hồ sơ người dùng.");
    return;
  }

  // Lưu trạng thái đăng nhập
  localStorage.setItem(
    "user",
    JSON.stringify({
      isLoggedIn: true,
      id: userId,
      email: user.email,
      displayName: profile.name,
      role: profile.role.toLowerCase(),
    })
  );

  // Ensure user exists in `customers` table for admin/customer views
  try {
    const { data: existingCust, error: custErr } = await supabase
      .from('customers')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (custErr) {
      notifyWarn('Lỗi kiểm tra bảng khách hàng: ' + (custErr?.message || custErr))
    } else if (!existingCust) {
      const { error: insertCustErr } = await supabase.from('customers').insert([
        {
          id: userId,
          name: profile.name,
          phone: profile.phone || user.user_metadata?.phone || '',
          email: user.email,
        },
      ]);
      if (insertCustErr) notifyWarn('Lỗi chèn khách hàng: ' + (insertCustErr?.message || insertCustErr))
    }
  } catch (e) {
    notifyWarn('Lỗi chèn/kiểm tra khách hàng: ' + (e?.message || e))
  }

  notifySuccess("Đăng nhập thành công!");

  // Điều hướng
  if (profile.role.toLowerCase() === "admin") {
    await router.replace("/admin");
  } else {
    await router.replace("/product");
  }
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 20px;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: white;
}

.login-card {
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header h1 {
  font-size: 2.5rem;
  color: #111827;
}

.login-header p {
  font-size: 1.1rem;
  color: #6b7280;
}

.login-input {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login-input:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  outline: none;
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6b7280;
  font-size: 1.2rem;
  transition: color 0.3s ease;
  padding: 8px;
}

.toggle-password:hover {
  color: #111827;
}

.divider {
  display: flex;
  align-items: center;
  color: #9ca3af;
  text-align: center;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  padding: 0 15px;
}

.login-side {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.side-content h3 {
  font-size: 1.8rem;
  margin-bottom: 2rem;
}

.side-content ul li {
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
}

@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-card {
    padding: 40px 25px;
  }

  .login-side {
    display: none;
  }

  .login-header h1 {
    font-size: 1.8rem;
  }

  .login-input {
    padding: 10px 14px;
    font-size: 0.95rem;
  }

  .btn-lg {
    padding: 10px 16px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .login-wrapper {
    padding: 10px;
  }

  .login-card {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }

  .login-header p {
    font-size: 0.95rem;
  }
}
</style>
