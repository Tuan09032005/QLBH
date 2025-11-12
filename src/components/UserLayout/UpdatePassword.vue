<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="bg-white p-4 rounded shadow-sm">
          <h2 class="mb-4 text-center">Set New Password</h2>
          <form @submit.prevent="updatePassword">
            <div class="mb-3">
              <label for="newPassword" class="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                class="form-control"
                v-model="newPassword"
                required
              />
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-success">
                Update Password
              </button>
            </div>
          </form>
          <div v-if="message" class="alert alert-info mt-3" role="alert">
            {{ message }}
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

const newPassword = ref("");
const message = ref("");
const router = useRouter();

const updatePassword = async () => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
  });

  if (error) {
    message.value = "Failed to update password: " + error.message;
    return;
  }

  message.value = "Password updated successfully!";
  setTimeout(() => router.push("/login"), 2000);
};
</script>
    