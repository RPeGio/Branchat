<script setup lang="ts">
import { ref } from 'vue';
import { OptionItem } from '../data/types';

const props = defineProps<OptionItem>();

const emits = defineEmits<{
    (e: 'update:modelValue', value: OptionItem): void;
}>();
</script>
<template>

</template>