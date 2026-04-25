<script setup lang="ts">
import type { HistoryItem } from '../data/types'

const props = defineProps<{
    isVisible: boolean;
    historyItems: HistoryItem[];
}>();
const emit = defineEmits<{ 
    close: [];
    load: [item: HistoryItem];
    'new-conversation': [];
}>();


const closeHistory = () => {
    emit('close');
};

// 新建对话
const createNewConversation = () => {
    // 触发新建对话事件
    emit('new-conversation');
    closeHistory(); // 创建新对话后关闭历史面板
};

// 加载选中的历史记录
const loadHistoryToApp = (item: HistoryItem) => {
    emit('load', item);
    closeHistory(); // 加载后关闭面板
};
</script>

<template>
    <Teleport to="#app">
        <Transition name="history-panel" enter-active-class="transition ease-in-out duration-300"
            enter-from-class="transform -translate-x-full opacity-0"
            enter-to-class="transform translate-x-0 opacity-100"
            leave-active-class="transition ease-in-out duration-300"
            leave-from-class="transform translate-x-0 opacity-100"
            leave-to-class="transform -translate-x-full opacity-0">
            <div class="fixed top-0 left-0 h-[calc(100vh-32px)] w-[420px] max-w-[90vw] bg-white shadow-2xl z-50 p-6 overflow-y-auto mt-8 border-r border-slate-200" v-if="props.isVisible" @click.stop>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-lg font-semibold text-slate-800">历史对话记录</h2>
                    <div class="flex items-center space-x-2">
                        <button @click="createNewConversation" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200" title="新建对话">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                        </button>
                        <button @click="closeHistory" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200" title="关闭">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                <div class="space-y-2">
                    <div v-for="item in [...props.historyItems].reverse()" :key="item.id"
                        class="w-full rounded-xl border border-slate-100 bg-white flex items-center px-4 py-3 cursor-pointer shadow-sm hover:border-indigo-200 hover:shadow-md hover:bg-slate-50/50 transition-all duration-200 group"
                        @click="loadHistoryToApp(item)">
                        <div class="flex-1 min-w-0">
                            <div class="truncate text-sm font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">{{ item.title }}</div>
                        </div>
                        <span class="ml-3 shrink-0 text-xs text-slate-400">{{ item.date }}</span>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>