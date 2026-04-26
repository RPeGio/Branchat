<script setup lang="ts">
const props = withDefaults(defineProps<{
    visible: boolean;
    message: string;
    mode?: 'alert' | 'confirm';
}>(), {
    mode: 'alert',
});

const emit = defineEmits<{
    close: [];
    confirm: [];
    cancel: [];
}>();

const handleConfirm = () => {
    emit('confirm');
};

const handleCancel = () => {
    emit('cancel');
};

const handleMaskClick = () => {
    if (props.mode === 'confirm') {
        emit('cancel');
    } else {
        emit('close');
    }
};
</script>

<template>
    <Teleport to="#app">
        <Transition name="notification" enter-active-class="transition ease-in-out duration-200"
            enter-from-class="opacity-0" enter-to-class="opacity-100"
            leave-active-class="transition ease-in-out duration-200"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="props.visible" class="fixed inset-0 bg-black/60 z-100 flex items-center justify-center"
                @click.self="handleMaskClick">
                <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-[90vw] flex flex-col items-center justify-center"
                    style="width: 400px; height: 250px;" @click.stop>
                    <p class="text-slate-700 text-center text-base leading-relaxed whitespace-pre-line wrap-break-words overflow-y-auto max-h-full w-full">
                        {{ props.message }}
                    </p>
                    <div v-if="props.mode === 'alert'" class="mt-6">
                        <button @click="handleConfirm"
                            class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md">
                            确定
                        </button>
                    </div>
                    <div v-else class="mt-6 flex space-x-4">
                        <button @click="handleCancel"
                            class="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all duration-200 text-sm font-medium shadow-sm">
                            取消
                        </button>
                        <button @click="handleConfirm"
                            class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md">
                            确认
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
