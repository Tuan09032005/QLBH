<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="text-center mb-4">LOG IN</h2>
        <p class="text-center">
          Don't have an account?
          <router-link to="/register" class="text-danger"
            >Register here</router-link
          >
        </p>
        <form @submit.prevent="login">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              id="email"
              placeholder="Please enter your email"
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
              placeholder="Please enter your password"
              v-model="password"
              required
            />
            <i
              class="bi"
              :class="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"
              style="
                position: absolute;
                bottom: 5px;
                right: 10px;
                cursor: pointer;
                font-size: 1.2em;
              "
              @click="togglePasswordVisibility"
            ></i>
          </div>
          <div class="d-grid">
            <button type="submit" class="btn btn-danger">Log In</button>
          </div>
          <div class="mt-3 text-center">
            <router-link
              to="/forgot-password"
              class="text-decoration-none text-primary"
            >
              Forgot your password?
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const router = useRouter();

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const login = async () => {
  if (!email.value || !password.value) {
    alert("Please enter email and password.");
    return;
  }

  // Đăng nhập với email + password
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    alert("Login failed: " + error.message);
    return;
  }

  // Refetch lại user để cập nhật trạng thái xác minh email
  const { data: freshUser, error: userError } = await supabase.auth.getUser();

  if (userError || !freshUser.user) {
    alert("Failed to retrieve user info.");
    return;
  }

  const user = freshUser.user;

  if (!user.email_confirmed_at) {
    alert("Your email is not verified. Please check your inbox.");
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
        name: user.user_metadata?.name || "User",
        phone: user.user_metadata?.phone || "",
        role: user.user_metadata?.role || "user",
        email: user.email,
      },
    ]);

    if (insert.error) {
      alert("Could not create profile.");
      return;
    }

    profile = insert.data[0];
  } else if (profileError) {
    alert("Failed to fetch user profile.");
    return;
  }

  // Lưu trạng thái đăng nhập
  localStorage.setItem(
    "user",
    JSON.stringify({
      isLoggedIn: true,
      displayName: profile.name,
      role: profile.role.toLowerCase(),
    })
  );

  alert("Login successful!");

  // Điều hướng
  if (profile.role.toLowerCase() === "admin") {
    router.push("/").then(() => window.location.reload());
  } else {
    router.push("/product").then(() => window.location.reload());
  }
};
</script>
