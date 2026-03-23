<script setup lang="ts">
import { ref } from 'vue';

// 定义组件属性和事件
const props = defineProps<{ isVisible: boolean }>();
const emit = defineEmits<{
    close: [];
    load: [item: HistoryItem];
}>();

// 历史记录项接口
interface HistoryItem {
    id: number;
    title: string;
    timestamp: Date;
}

// 示例历史记录数据
const historyItems = ref<HistoryItem[]>([
    { id: 1, title: '关于项目架构的讨论', timestamp: new Date() },
    { id: 2, title: 'API 设计优化建议', timestamp: new Date(Date.now() - 86400000) }, // 一天前
    { id: 3, title: '数据库性能优化方案', timestamp: new Date(Date.now() - 172800000) }, // 两天前
    { id: 4, title: '前端UI组件重构', timestamp: new Date(Date.now() - 259200000) }, // 三天前
    { id: 5, title: '安全漏洞修复指南', timestamp: new Date(Date.now() - 345600000) }, // 四天前
    { id: 6, title: '部署流程自动化', timestamp: new Date(Date.now() - 432000000) }, // 五天前
]);

// 关闭历史记录面板
const closeHistory = () => {
    emit('close');
};

// 加载选中的历史记录
const loadHistory = (item: HistoryItem) => {
    emit('load', item);
    closeHistory(); // 加载后关闭面板
};
</script>

<template>
    <Teleport to="body">
        <Transition name="history-panel" enter-active-class="transition ease-in-out duration-300"
            enter-from-class="transform -translate-x-full opacity-0"
            enter-to-class="transform translate-x-0 opacity-100"
            leave-active-class="transition ease-in-out duration-300"
            leave-from-class="transform translate-x-0 opacity-100"
            leave-to-class="transform -translate-x-full opacity-0">
            <div class="fixed top-0 left-0 h-full w-2/5 bg-[#eefbff] shadow-xl z-50 p-6 overflow-y-auto mt-7.5" v-if="isVisible" @click.stop>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold">历史对话记录</h2>
                    <button @click="closeHistory" class="text-gray-500 hover:text-gray-700 text-2xl">
                        &times;
                    </button>
                </div>

                <!-- 历史记录列表 -->
                <div class="space-y-3">
                    <div v-for="(item, index) in historyItems" :key="index"
                        class="w-full h-12 rounded-lg bg-[#ffffff] flex items-center px-4 cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200"
                        @click="loadHistory(item)">
                        <span class="truncate">{{ item.title }}</span>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>