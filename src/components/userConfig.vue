<script setup lang="ts">
import { ref, watch } from 'vue';
import { Store } from '@tauri-apps/plugin-store';

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
const bearerToken = defineModel<string>('bearerToken', { default: '' });
const tokenDisplayForm = ref<string>('password');

watch(bearerToken, async (newToken, oldToken) => {
    if (newToken != oldToken) {
        const store = await Store.load('store.json');
        await store.set('bearerToken', newToken);
    }
});

const toggleTokenVisibility = () => {
    tokenDisplayForm.value = tokenDisplayForm.value === 'password' ? 'text' : 'password';
};

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
            <div class="fixed top-0 right-0 h-[calc(100vh-32px)] w-105 max-w-[90vw] bg-white shadow-2xl z-50 p-6 overflow-y-auto mt-8 border-l border-slate-200"
                v-if="props.isVisible" @click.stop>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-lg font-semibold text-slate-800">用户配置</h2>
                    <button @click="closeConfig" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 text-xl cursor-pointer">
                        &times;
                    </button>
                </div>

                <!-- 自定义SystemPrompt -->
                <div class="mb-8">
                    <h3 class="text-base font-semibold text-slate-700 mb-4 flex items-center">
                        <span class="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
                        自定义系统提示词
                    </h3>

                    <!-- 全局系统提示词 -->
                    <div class="mb-6">
                        <div class="flex items-center mb-2 relative">
                            <label class="text-sm font-medium text-slate-600">全局系统提示词</label>
                            <div class="relative inline-block">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    @mouseenter="showGlobalTooltip = true"
                                    @mouseleave="showGlobalTooltip = false">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div v-if="showGlobalTooltip"
                                    class="absolute left-0 bottom-6 z-50 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl max-w-56 min-w-40 w-fit transition-opacity duration-200 opacity-100 whitespace-normal transform -translate-x-1/3 pointer-events-none">
                                    新建对话时默认的提示词，若没有指定当前对话系统提示词则使用此提示词
                                </div>
                            </div>
                        </div>
                        <textarea v-model="globalSystemPrompt"
                            class="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none bg-slate-50 focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none text-sm text-slate-700 placeholder-slate-400 transition-all duration-200"
                            :placeholder="defaultSystemPrompt"></textarea>
                    </div>

                    <!-- 当前对话系统提示词 -->
                    <div>
                        <div class="flex items-center mb-2 relative">
                            <label class="text-sm font-medium text-slate-600">当前对话系统提示词</label>
                            <div class="relative inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors shrink-0"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    @mouseenter="showCurrentTooltip = true"
                                    @mouseleave="showCurrentTooltip = false">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div v-if="showCurrentTooltip"
                                    class="absolute left-0 bottom-6 z-50 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl max-w-56 min-w-40 w-fit transition-opacity duration-200 opacity-100 whitespace-normal transform -translate-x-1/3 pointer-events-none">
                                    当前对话提示词，留空则使用全局提示词，若当前对话已开始，则无法再更改提示词
                                </div>
                                <span v-if="isFirstMessageSent" class="ml-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg whitespace-nowrap shrink-0 font-medium">
                                    对话已开始，提示词已锁定
                                </span>
                            </div>
                        </div>
                        <textarea v-model="config.systemPrompt"
                            :disabled="isFirstMessageSent"
                            :class="[
                                'w-full h-32 px-4 py-3 border rounded-xl focus:outline-none resize-none text-sm transition-all duration-200',
                                isFirstMessageSent 
                                    ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-slate-700 placeholder-slate-400'
                            ]"
                            :placeholder="globalSystemPrompt ? globalSystemPrompt: defaultSystemPrompt"
                            :title="isFirstMessageSent ? '当前对话已开始，无法修改系统提示词' : ''"></textarea>
                    </div>
                </div>

                <!-- 自定义模型参数 -->
                <div class="mb-8">
                    <h3 class="text-base font-semibold text-slate-700 mb-4 flex items-center">
                        <span class="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
                        自定义模型参数
                    </h3>

                    <div class="space-y-5">
                        <div>
                            <div class="flex justify-between mb-1.5">
                                <span class="text-sm font-medium text-slate-600">temperature</span>
                                <span class="text-sm font-mono text-indigo-600">{{ config.temperature.toFixed(2) }}</span>
                            </div>
                            <input type="range" min="0" max="2" step="0.01" v-model.number="config.temperature"
                                class="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
                            <p class="text-xs text-slate-400 mt-1">控制AI回复的随机性，值越高越随机</p>
                        </div>

                        <div>
                            <div class="flex justify-between mb-1.5">
                                <span class="text-sm font-medium text-slate-600">max_tokens</span>
                                <span class="text-sm font-mono text-indigo-600">{{ config.maxTokens }}</span>
                            </div>
                            <input type="range" min="500" max="8000" step="100" v-model.number="config.maxTokens"
                                class="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
                            <p class="text-xs text-slate-400 mt-1">控制AI回复的最大长度</p>
                        </div>

                        <div>
                            <div class="flex justify-between mb-1.5">
                                <span class="text-sm font-medium text-slate-600">top_p</span>
                                <span class="text-sm font-mono text-indigo-600">{{ config.topP.toFixed(2) }}</span>
                            </div>
                            <input type="range" min="-1" max="1" step="0.01" v-model.number="config.topP"
                                class="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
                            <p class="text-xs text-slate-400 mt-1">temperature的替代方案（不建议同时修改top_p与temperature）</p>
                        </div>

                        <div>
                            <div class="flex justify-between mb-1.5">
                                <span class="text-sm font-medium text-slate-600">frequency_penalty</span>
                                <span class="text-sm font-mono text-indigo-600">{{ config.frequencyPenalty.toFixed(2) }}</span>
                            </div>
                            <input type="range" min="-2" max="2" step="0.1" v-model.number="config.frequencyPenalty"
                                class="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
                            <p class="text-xs text-slate-400 mt-1">如果该值为正，将降低模型重复相同内容的可能性</p>
                        </div>
                    </div>
                </div>

                <!-- API Token 配置 -->
                <div class="mb-8">
                    <h3 class="text-base font-semibold text-slate-700 mb-4 flex items-center">
                        <span class="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
                        API Token 配置
                    </h3>
                    <div class="space-y-3">
                        <div>
                            <label class="text-sm font-medium text-slate-600 block mb-1.5">Deepseek Bearer Token</label>
                            <div class="flex space-x-2">
                                <input :type="tokenDisplayForm" v-model="bearerToken"
                                    class="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-xs bg-slate-50 text-slate-700 placeholder-slate-400"
                                    placeholder="输入您的 API Token" />
                                <button @click="toggleTokenVisibility"
                                    class="shrink-0 px-3 py-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-all duration-200 text-sm font-medium">
                                    <template v-if="tokenDisplayForm === 'password'">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </template>
                                    <template v-else>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                    </template>
                                </button>
                            </div>
                            <p class="text-xs text-slate-400 mt-1">修改后将自动保存</p>
                        </div>
                    </div>
                </div>

                <!-- 指令列表指南 -->
                <div class="mb-6">
                    <h3 class="text-base font-semibold text-slate-700 mb-4 flex items-center">
                        <span class="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
                        指令列表指南
                    </h3>
                    <div class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-600">
                            <li><code class="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-medium">/balance</code> 查询当前API Token余额</li>
                            <li><code class="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-medium">/clearHistory</code> 清空所有历史对话记录</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>