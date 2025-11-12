<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="text-center mb-4">REGISTER</h2>
        <p class="text-center">
          Already have an account?
          <router-link to="/login" class="text-danger">Log in here</router-link>
        </p>
        <form @submit.prevent="register">
          <div class="mb-3">
            <label for="displayName" class="form-label">Display Name</label>
            <input
              type="text"
              class="form-control"
              id="displayName"
              placeholder="Enter display name"
              v-model="displayName"
              required
            />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              id="email"
              placeholder="Enter email"
              v-model="email"
              required
            />
          </div>
          <div class="mb-3 position-relative">
            <label for="password" class="form-label">Password</label>
            <input
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              id="password"
              placeholder="Enter password"
              v-model="password"
              required
            />
            <i
              class="bi"
              :class="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"
              style="
                position: absolute;
                font-size: 1.2em;
                right: 10px;
                bottom: 5px;
                cursor: pointer;
              "
              @click="togglePasswordVisibility"
            ></i>
          </div>
          <div class="mb-3 position-relative">
            <label for="confirmPassword" class="form-label"
              >Confirm Password</label
            >
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-control"
              id="confirmPassword"
              placeholder="Confirm password"
              v-model="confirmPassword"
              required
            />
            <i
              class="bi"
              :class="showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"
              style="
                position: absolute;
                font-size: 1.2em;
                right: 10px;
                bottom: 5px;
                cursor: pointer;
              "
              @click="toggleConfirmPasswordVisibility"
            ></i>
          </div>
          <div class="mb-3">
            <label for="phoneNumber" class="form-label">Phone Number</label>
            <input
              type="text"
              class="form-control"
              id="phoneNumber"
              placeholder="Enter phone number"
              v-model="phoneNumber"
              required
            />
          </div>
          <div class="d-grid">
            <button type="submit" class="btn btn-danger">Register</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase"; // Đảm bảo đường dẫn đúng với file bạn cấu hình Supabase

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
    alert("Passwords do not match!");
    return;
  }

  if (password.value.length < 6) {
    alert("Password must be at least 6 characters.");
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
    alert("Registration failed: " + error.message);
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
    console.error("Insert error:", insertError);
    alert("Please check your gmail.");
    return;
  }

  alert(
    "Registration successful! Please check your email to verify your account."
  );
  router.push("/login");
};
</script>
