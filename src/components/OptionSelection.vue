<script setup lang="ts">
import { ref } from 'vue';
import { OptionItem } from '../data/types';

const props = defineProps<OptionItem>();

const emits = defineEmits<{
    (e: 'select', value: string): void;
    (e: 'close'): void;
}>();

const positiveInputValue = ref<string>('');
const negativeInputValue = ref<string>('');

const handlePositiveSelect = () => {
    let result = props.positive || '';
    if (props.positiveExtraInput && positiveInputValue.value) {
        result += `:${positiveInputValue.value}`;
    }
    emits('select', result);
};

const handleNegativeSelect = () => {
    let result = props.negative || '';
    if (props.negativeExtraInput && negativeInputValue.value) {
        result += `:${negativeInputValue.value}`;
    }
    emits('select', result);
};
</script>

<template>
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex flex-col items-center justify-center p-4 pb-4 pt-2 w-full">
        <div class="text-center mb-2 text-gray-700 font-medium">
            <em>AI为你提供了选项，请单击选择：</em>
        </div>
        <div class="flex space-x-4">
            <button 
                @click="handlePositiveSelect"
                class="whitespace-nowrap shrink-0 min-w-50 bg-[#328ef1] hover:bg-[#0479f6] text-white px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
                <span>{{ props.positive as string + (positiveExtraInput ? ': ' : '') }}</span>
                <input 
                    v-if="positiveExtraInput"
                    v-model="positiveInputValue"
                    @click.stop
                    type="text"
                    placeholder="请输入..."
                    class="w-32 px-2 py-0.5= border border-white/30 rounded focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 text-sm"
                />
            </button>
            <button 
                @click="handleNegativeSelect"
                class="whitespace-nowrap shrink-0 min-w-50 bg-[#eb5bcc] hover:bg-[#ef29c4] text-white px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
                <span>{{ props.negative as string + (negativeExtraInput ? ': ' : '') }}</span>
                <input 
                    v-if="negativeExtraInput"
                    v-model="negativeInputValue"
                    @click.stop
                    type="text"
                    placeholder="请输入..."
                    class="w-32 px-2 py-0.5 border border-white/30 rounded focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 text-sm"
                />
            </button>
            <button 
                @click="emits('close')"
                class="whitespace-nowrap shrink-0 min-w-50 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
                <span class="underline">我不想使用AI给我提供的选项</span>
            </button>
        </div>
    </div>
</template>