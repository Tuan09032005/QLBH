<template>
  <div class="bg-light py-3 py-md-5">
    <div class="container">
      <div class="row justify-content-md-center">
        <div class="col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6">
          <div class="bg-white p-4 p-md-5 rounded shadow-sm">
            <div class="mb-5">
              <h2 class="h3">Password Reset</h2>
              <p class="text-secondary m-0">
                Provide your email address to reset your password.
              </p>
            </div>

            <form @submit.prevent="resetPassword">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  class="form-control"
                  v-model="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div class="d-grid">
                <button type="submit" class="btn btn-primary">
                  Send Reset Email
                </button>
              </div>

              <!-- Thông báo thành công -->
              <div
                v-if="successMessage"
                class="alert alert-success mt-4"
                role="alert"
              >
                A reset link has been sent to your email.
              </div>
            </form>

            <hr class="mt-5 mb-4 border-secondary-subtle" />
            <div class="d-flex gap-4 justify-content-end">
              <router-link to="/login" class="text-danger">Login</router-link>
              <router-link to="/register" class="text-danger"
                >Register</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";

const email = ref("");
const successMessage = ref(false);
const router = useRouter();

const resetPassword = async () => {
  if (!email.value) {
    alert("Please enter your email.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: "http://localhost:5173/update-password", // Địa chỉ này phải đúng với route bạn tạo bên dưới
  });

  if (error) {
    alert("Failed to send reset email: " + error.message);
    return;
  }

  successMessage.value = true;
  email.value = "";
};
</script>
