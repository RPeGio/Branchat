<script setup lang="ts">
import { watch } from 'vue'

const props = withDefaults(defineProps<{
    message: string
    visible: boolean
    duration?: number
}>(), {
    duration: 3000,
})

const emit = defineEmits<{
    close: []
}>()

let timer: ReturnType<typeof setTimeout> | null = null

watch(() => props.visible, (val) => {
    if (val) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            emit('close')
        }, props.duration)
    } else {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
    }
})
</script>

<template>
    <Teleport to="#app">
        <Transition name="snackbar" enter-active-class="transition-all ease-out duration-300"
            enter-from-class="-translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition-all ease-in duration-200" leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-full opacity-0">
            <div v-if="props.visible"
                class="fixed top-14 left-1/2 -translate-x-1/2 z-200 flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xl max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span class="text-slate-700 text-sm font-medium">{{ props.message }}</span>
            </div>
        </Transition>
    </Teleport>
</template>
