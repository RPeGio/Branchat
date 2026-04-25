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
    <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 flex flex-col items-center justify-center p-4 pb-4 pt-3.5 w-full shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div class="text-center mb-3 text-slate-500 text-sm">
            <em>AI为你提供了选项，请单击选择：&nbsp;</em><span @click="emits('close')" class="text-indigo-500 underline cursor-pointer hover:text-indigo-700 transition-colors">跳过选项</span>
        </div>
        <div class="flex space-x-4">
            <button 
                @click="handlePositiveSelect"
                class="whitespace-nowrap shrink-0 min-w-30 bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md text-white px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium text-sm"
            >
                <span>{{ props.positive as string + (positiveExtraInput ? ': ' : '') }}</span>
                <input 
                    v-if="positiveExtraInput"
                    v-model="positiveInputValue"
                    @click.stop
                    type="text"
                    placeholder="请输入..."
                    class="w-32 px-2 py-1 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-slate-700 text-sm bg-white/90"
                />
            </button>
            <button 
                @click="handleNegativeSelect"
                class="whitespace-nowrap shrink-0 min-w-30 bg-slate-700 hover:bg-slate-800 shadow-sm hover:shadow-md text-white px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium text-sm"
            >
                <span>{{ props.negative as string + (negativeExtraInput ? ': ' : '') }}</span>
                <input 
                    v-if="negativeExtraInput"
                    v-model="negativeInputValue"
                    @click.stop
                    type="text"
                    placeholder="请输入..."
                    class="w-32 px-2 py-1 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-slate-700 text-sm bg-white/90"
                />
            </button>
        </div>
    </div>
</template>