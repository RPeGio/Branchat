<script setup lang="ts">
const props = defineProps<{
    visible: boolean;
    message: string;
}>();

const emit = defineEmits<{
    close: [];
}>();

const handleClose = () => {
    emit('close');
};
</script>

<template>
    <Teleport to="#app">
        <Transition name="notification" enter-active-class="transition ease-in-out duration-200"
            enter-from-class="opacity-0" enter-to-class="opacity-100"
            leave-active-class="transition ease-in-out duration-200"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="props.visible" class="fixed inset-0 bg-black/60 z-100 flex items-center justify-center"
                @click.self="handleClose">
                <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-[90vw] flex flex-col items-center justify-center"
                    style="width: 400px; height: 250px;" @click.stop>
                    <p class="text-slate-700 text-center text-base leading-relaxed whitespace-pre-line wrap-break-words overflow-y-auto max-h-full w-full">
                        {{ props.message }}
                    </p>
                    <button @click="handleClose"
                        class="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md">
                        确定
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
