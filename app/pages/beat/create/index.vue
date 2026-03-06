<template>
  <div
    class="temin-h-screen flex flex-col items-center justify-center text-center px-4 py-8"
  >
    <p class="text-gray-300">
      Welcome to your producer dashboard! This is where you can manage your
      beats.
    </p>
  </div>
</template>

<script setup lang="ts">
// This page is protected by the producer-only middleware
// Only producers can access this page
definePageMeta({
  middleware: "producer-only",
});
</script>
