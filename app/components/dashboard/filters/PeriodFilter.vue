<template>
  <div class="relative">
    <select
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="appearance-none bg-[#1a1f35] text-white border border-gray-700/50 rounded-lg px-3 py-2 pr-8 text-sm outline-none cursor-pointer hover:bg-[#252b45] transition-all"
    >
      <option value="week">This Week</option>
      <option value="month">This Month</option>
      <option value="year">This Year</option>
      <option value="all">All Time</option>
    </select>
    <Icon
      name="ph:caret-down"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      size="14"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>
