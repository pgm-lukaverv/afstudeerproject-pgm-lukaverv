<template>
  <NuxtLink
    @click.prevent="goBack"
    :class="containerClass"
    class="inline-flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition-colors group"
  >
    <Icon
      name="ph:arrow-left"
      :size="iconSize"
      class="group-hover:-translate-x-1 transition-transform"
    />
    <span class="font-medium">{{ label }}</span>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: "Back",
  },
  iconSize: {
    type: String,
    default: "20",
  },
  containerClass: {
    type: String,
    default: "",
  },
});

const { goBack } = useNavigation();
</script>
