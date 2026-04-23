<script setup lang="ts">
import { ref } from 'vue';

import type { ConfigItem } from '../data/types';

interface Props {
    isVisible: boolean,
    defaultSystemPrompt: string,
}

const props = defineProps<Props>();

const emit = defineEmits<{
    close: [];
}>();

const showGlobalTooltip = ref(false);
const showCurrentTooltip = ref(false);

const defaultSystemPrompt = props.defaultSystemPrompt;
const globalSystemPrompt = defineModel<string>('globalSystemPrompt');
const config = defineModel<ConfigItem>('userConfig', {
    required: true,
    default: () => ({
        systemPrompt: '',
        temperature: 1,
        maxTokens: 4000,
        topP: 0.9,
        frequencyPenalty: 0.5
    })
});
const isFirstMessageSent = defineModel<boolean>('isFirstMessageSent');
// const { systemPrompt, temperature, maxTokens, topP, frequencyPenalty } = toRefs(config.value as ConfigItem);

// 监听config变化，便于调试
// watch(config, (newValue, oldValue) => {
//     console.log('config changed:', { oldValue, newValue });
// }, { deep: true, immediate: true });

// // 监听组件可见性变化，检查config状态
// watch(() => props.isVisible, (isVisible) => {
//     if (isVisible) {
//         console.log('UserConfig became visible, config:', config.value);
//     }
// });

// 判断当前对话系统提示词是否应该被锁定
// const isCurrentPromptLocked = computed(() => {
//     // 一旦当前对话系统提示词被设置（非空），就永久锁定
//     return config.value.systemPrompt.trim() !== '';
// });

// 关闭配置面板
const closeConfig = () => {
    emit('close');
};

defineExpose({
    config
});
</script>

<template>
    <Teleport to="#app">
        <Transition name="config-panel" enter-active-class="transition ease-in-out duration-300"
            enter-from-class="transform translate-x-full opacity-0" enter-to-class="transform translate-x-0 opacity-100"
            leave-active-class="transition ease-in-out duration-300"
            leave-from-class="transform translate-x-0 opacity-100"
            leave-to-class="transform translate-x-full opacity-0">
            <div class="fixed top-0 right-0 h-full w-2/5 bg-[#eefbff] shadow-xl z-50 p-6 overflow-y-auto mt-7.5"
                v-if="props.isVisible" @click.stop>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold">用户配置</h2>
                    <button @click="closeConfig" class="text-gray-500 hover:text-gray-700 text-2xl">
                        &times;
                    </button>
                </div>

                <!-- 自定义SystemPrompt -->
                <div class="mb-8">
                    <h3 class="text-lg font-semibold mb-4 flex items-center">
                        自定义系统提示词
                    </h3>

                    <!-- 全局系统提示词 -->
                    <div class="mb-6">
                        <div class="flex items-center mb-2 relative">
                            <label class="font-medium">全局系统提示词</label>
                            <div class="relative inline-block">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 text-gray-500"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    @mouseenter="showGlobalTooltip = true"
                                    @mouseleave="showGlobalTooltip = false">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div v-if="showGlobalTooltip"
                                    class="absolute left-0 bottom-6 z-50 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg max-w-50 min-w-37.5 w-fit transition-opacity duration-300 opacity-100 whitespace-normal transform translate-x-[-40%]"
                                    style="border-radius: 5px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                    新建对话时默认的提示词，若没有指定当前对话系统提示词则使用此提示词
                                </div>
                            </div>
                        </div>
                        <textarea v-model="globalSystemPrompt"
                            class="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                            :placeholder="defaultSystemPrompt"></textarea>
                    </div>

                    <!-- 当前对话系统提示词 -->
                    <div>
                        <div class="flex items-center mb-2 relative">
                            <label class="font-medium">当前对话系统提示词</label>
                            <div class="relative inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 text-gray-500 shrink-0"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    @mouseenter="showCurrentTooltip = true"
                                    @mouseleave="showCurrentTooltip = false">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div v-if="showCurrentTooltip"
                                    class="absolute left-0 bottom-6 z-50 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg max-w-50 min-w-37.5 w-fit transition-opacity duration-300 opacity-100 whitespace-normal transform translate-x-[-40%]"
                                    style="border-radius: 5px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                    当前对话提示词，留空则使用全局提示词，若当前对话已开始，则无法再更改提示词
                                </div>
                                <span v-if="isFirstMessageSent" class="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
                                    （当前对话已开始，不可再更改提示词）
                                </span>
                            </div>
                        </div>
                        <textarea v-model="config.systemPrompt"
                            :disabled="isFirstMessageSent"
                            :class="[
                                'w-full h-32 px-4 py-2 border rounded-lg focus:outline-none resize-none',
                                isFirstMessageSent 
                                    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                    : 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500'
                            ]"
                            :placeholder="globalSystemPrompt ? globalSystemPrompt: defaultSystemPrompt"
                            :title="isFirstMessageSent ? '当前对话已开始，无法修改系统提示词' : ''"></textarea>
                    </div>
                </div>

                <!-- 自定义模型参数 -->
                <div class="mb-8">
                    <h3 class="text-lg font-semibold mb-4">自定义模型参数</h3>

                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between mb-1">
                                <span>temperature</span>
                                <span>{{ config.temperature.toFixed(2) }}</span>
                            </div>
                            <input type="range" min="0" max="2" step="0.01" v-model.number="config.temperature"
                                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            <p class="text-sm text-gray-500 mt-1">控制AI回复的随机性，值越高越随机</p>
                        </div>

                        <div>
                            <div class="flex justify-between mb-1">
                                <span>max_tokens</span>
                                <span>{{ config.maxTokens }}</span>
                            </div>
                            <input type="range" min="500" max="8000" step="100" v-model.number="config.maxTokens"
                                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            <p class="text-sm text-gray-500 mt-1">控制AI回复的最大长度</p>
                        </div>

                        <div>
                            <div class="flex justify-between mb-1">
                                <span>top_p</span>
                                <span>{{ config.topP.toFixed(2) }}</span>
                            </div>
                            <input type="range" min="-1" max="1" step="0.01" v-model.number="config.topP"
                                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            <p class="text-sm text-gray-500 mt-1">temperature的替代方案（不建议同时修改top_p与temperature）</p>
                        </div>

                        <div>
                            <div class="flex justify-between mb-1">
                                <span>frequency_penalty</span>
                                <span>{{ config.frequencyPenalty.toFixed(2) }}</span>
                            </div>
                            <input type="range" min="-2" max="2" step="0.1" v-model.number="config.frequencyPenalty"
                                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            <p class="text-sm text-gray-500 mt-1">如果该值为正，将降低模型重复相同内容的可能性</p>
                        </div>
                    </div>
                </div>

                <!-- 指令列表指南 -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-4">指令列表指南</h3>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <ul class="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>/displayToken</strong>: 显示当前 API Token</li>
                            <li><strong>/hideToken</strong>: 隐藏当前 API Token</li>
                            <li><strong>/balance</strong>: 查询当前API Token余额</li>
                            <li><strong>/clearHistory</strong>: 清空所有历史对话记录</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>