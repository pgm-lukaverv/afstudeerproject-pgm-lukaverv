<script setup lang="ts">
const route = useRoute();

// Set page title from route metadata or use default
useHead({
  title: computed(() => (route.meta.title as string) || "Beatstack"),
  titleTemplate: (titleChunk) => {
    return titleChunk && titleChunk !== "Beatstack"
      ? `${titleChunk} - Beatstack`
      : "Beatstack";
  },
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html,
body {
  background-color: #0f1219;
  overflow-x: hidden;
}
</style>
