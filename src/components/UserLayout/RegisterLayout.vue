<template>
  <div class="login-wrapper">
    <div class="login-container">
      <!-- Form Section -->
      <div class="login-card">
        <div class="login-header text-center mb-5">
          <h1 class="fw-bold mb-2">Đăng Ký</h1>
          <p class="text-muted">Tạo tài khoản SPORTY7 của bạn</p>
        </div>

        <form @submit.prevent="register">
          <!-- Display Name -->
          <div class="mb-4">
            <label for="displayName" class="form-label fw-semibold">Tên hiển thị</label>
            <input
              type="text"
              class="form-control form-control-lg login-input"
              id="displayName"
              placeholder="Nhập tên hiển thị"
              v-model="displayName"
              required
            />
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="form-label fw-semibold">Email</label>
            <input
              type="email"
              class="form-control form-control-lg login-input"
              id="email"
              placeholder="Nhập địa chỉ email"
              v-model="email"
              required
            />
          </div>

          <!-- Phone Number -->
          <div class="mb-4">
            <label for="phoneNumber" class="form-label fw-semibold">Số điện thoại</label>
            <input
              type="text"
              class="form-control form-control-lg login-input"
              id="phoneNumber"
              placeholder="Nhập số điện thoại"
              v-model="phoneNumber"
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
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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

          <!-- Confirm Password -->
          <div class="mb-4">
            <label for="confirmPassword" class="form-label fw-semibold">Xác nhận mật khẩu</label>
            <div class="position-relative">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-control form-control-lg login-input"
                id="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                v-model="confirmPassword"
                required
              />
              <i
                class="bi toggle-password"
                :class="showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"
                @click="toggleConfirmPasswordVisibility"
              ></i>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-danger btn-lg fw-semibold">
              Đăng Ký
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="divider my-4"><span>hoặc</span></div>

        <!-- Login Link -->
        <p class="text-center text-muted">
          Đã có tài khoản?
          <router-link to="/login" class="text-danger fw-semibold text-decoration-none">
            Đăng nhập tại đây
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase"; // Đảm bảo đường dẫn đúng với file bạn cấu hình Supabase
import { notifyError, notifyWarn, notifySuccess } from '@/stores/notifications'

const displayName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const phoneNumber = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const router = useRouter();

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const register = async () => {
  // Kiểm tra dữ liệu
  if (password.value !== confirmPassword.value) {
    notifyError("Mật khẩu không khớp!");
    return;
  }

  if (password.value.length < 6) {
    notifyError("Mật khẩu phải có ít nhất 6 ký tự.");
    return;
  }

  // Đăng ký với Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        name: displayName.value,
        phone: phoneNumber.value,
        role: "user",
      },
    },
  });

  if (error) {
    notifyError("Đăng ký thất bại: " + (error?.message || error));
    return;
  }

  // Ghi vào bảng login
  const { error: insertError } = await supabase.from("login").insert([
    {
      id: data.user.id,
      name: displayName.value,
      phone: phoneNumber.value,
      role: "user",
      email: email.value,
    },
  ]);

  if (insertError) {
    notifyError("Lỗi chèn: " + (insertError?.message || insertError));
    return;
  }

  // Ghi vào bảng customers để theo dõi khách hàng (nếu bạn muốn tách login và customers)
  try {
    const { error: custErr } = await supabase.from('customers').insert([{ 
      id: data.user.id,
      name: displayName.value,
      phone: phoneNumber.value,
      email: email.value
    }]);
    if (custErr) {
      // Không dừng flow nếu lỗi (có thể bảng chưa tồn tại)
      notifyWarn('Cảnh báo chèn vào bảng khách hàng: ' + (custErr?.message || custErr));
    }
  } catch (e) {
    notifyWarn('Lỗi chèn khách hàng: ' + (e?.message || e));
  }

  notifySuccess(
    "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản của bạn."
  );
  router.push("/login");
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

@media (max-width: 768px) {
  .login-card {
    padding: 40px 25px;
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
