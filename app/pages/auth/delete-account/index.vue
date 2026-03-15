<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0d1230] to-[#0a0e27]"
  >
    <Logo />

    <div
      class="w-full max-w-md p-8 bg-[#161b33] rounded-2xl border border-gray-800 shadow-2xl"
    >
      <!-- Deleted state -->
      <div v-if="deleted" class="text-center space-y-4">
        <div
          class="w-16 h-16 mx-auto rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center"
        >
          <Icon name="ph:check-circle" size="32" class="text-green-400" />
        </div>
        <h2 class="text-2xl font-bold text-white">Account Deleted</h2>
        <p class="text-gray-400 text-sm">
          Your account and all associated data have been permanently removed.
        </p>
        <button
          @click="
            async () => {
              await logout();
              navigateTo('/');
            }
          "
          class="mt-2 inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
        >
          Continue
        </button>
      </div>

      <!-- Blocked state (token cleared after 3 failed attempts) -->
      <div v-else-if="blocked" class="text-center space-y-4">
        <div
          class="w-16 h-16 mx-auto rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center"
        >
          <Icon name="ph:lock" size="32" class="text-red-400" />
        </div>
        <h2 class="text-2xl font-bold text-white">Link Disabled</h2>
        <p class="text-gray-400 text-sm">
          Too many failed password attempts. This deletion link has been
          permanently disabled. Request a new one from your settings if you'd
          like to continue.
        </p>
        <NuxtLink
          to="/auth/login"
          class="mt-2 inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
        >
          Go to Login
        </NuxtLink>
      </div>

      <!-- Token invalid/expired -->
      <div v-else-if="invalidToken" class="text-center space-y-4">
        <div
          class="w-16 h-16 mx-auto rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center"
        >
          <Icon name="ph:clock-countdown" size="32" class="text-orange-400" />
        </div>
        <h2 class="text-2xl font-bold text-white">Link Expired</h2>
        <p class="text-gray-400 text-sm">
          This link is no longer valid. Request a new one from your account
          settings.
        </p>
        <NuxtLink
          to="/settings"
          class="inline-block mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
        >
          Back to Settings
        </NuxtLink>
      </div>

      <!-- Password confirmation form -->
      <template v-else>
        <div class="flex flex-col items-center mb-6 gap-3">
          <div
            class="w-14 h-14 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center"
          >
            <Icon name="ph:warning" size="28" class="text-red-400" />
          </div>
          <div class="text-center">
            <h2 class="text-2xl font-bold text-white">Delete Account</h2>
            <p class="text-gray-400 text-sm mt-1">
              This action is permanent and cannot be undone.
            </p>
          </div>
        </div>

        <!-- OAuth user: no password needed -->
        <div v-if="isOAuthUser" class="space-y-4">
          <p class="text-gray-400 text-sm text-center">
            You're signed in with a social account. Click below to permanently
            delete your account.
          </p>
          <p v-if="error" class="text-red-400 text-sm text-center">
            {{ error }}
          </p>
          <button
            @click="handleConfirm"
            :disabled="loading"
            class="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {{ loading ? "Deleting..." : "Permanently Delete My Account" }}
          </button>
        </div>

        <!-- Password user: require password -->
        <VForm v-else @submit="handleConfirm" class="space-y-4">
          <PasswordInput
            name="password"
            label="Confirm your password"
            placeholder="Enter your password"
            rules="required"
            autocomplete="current-password"
          />

          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? "Verifying..." : "Permanently Delete My Account" }}
          </button>

          <NuxtLink
            to="/settings"
            class="block text-center text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel — take me back to settings
          </NuxtLink>
        </VForm>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: "Delete Account", layout: "default" });

const route = useRoute();
const { logout } = useLogout();

const token = route.query.token as string;

const loading = ref(false);
const error = ref("");
const deleted = ref(false);
const blocked = ref(false);
const invalidToken = ref(!token);

// OAuth users have no password — detect via API when they land on the page
const isOAuthUser = ref(false);

onMounted(async () => {
  if (!token) return;
  try {
    const data = await $fetch<{ isOAuth: boolean }>(
      `/api/auth/delete-account-info?token=${token}`,
    );
    isOAuthUser.value = data.isOAuth;
  } catch {
    invalidToken.value = true;
  }
});

const handleConfirm = async (values?: Record<string, any>) => {
  error.value = "";
  loading.value = true;
  try {
    await $fetch("/api/auth/confirm-delete", {
      method: "POST",
      body: { token, password: values?.password ?? "" },
    });
    deleted.value = true;
  } catch (err: any) {
    const status = err?.status ?? err?.statusCode;
    const msg = err?.data?.message ?? err?.message ?? "Something went wrong.";
    if (status === 403) {
      blocked.value = true;
    } else if (status === 410 || status === 404) {
      invalidToken.value = true;
    } else {
      error.value = msg;
    }
  } finally {
    loading.value = false;
  }
};
</script>
