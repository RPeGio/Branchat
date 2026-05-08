<script setup lang="ts">

interface Props {
    character: string | null;
    content?: string,
};

const prop = withDefaults(defineProps<Props>(), {
    character: null,
    content: '',
});
</script>
<template>
    <!-- 系统欢迎消息 -->
    <div v-if="prop.character == 'assistant'" class="flex justify-start">
        <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-5 py-3 max-w-[70%] shadow-sm">
            <p class="msg msg-ai text-slate-700">{{ prop.content }}<slot></slot></p>
        </div>
    </div>

    <!-- 用户消息示例 -->
    <div v-if="prop.character == 'user'" class="flex justify-end">
        <div class="bg-indigo-600 text-white rounded-2xl rounded-br-md px-5 py-3 max-w-[70%] shadow-sm">
            <p class="msg msg-user text-white">{{ prop.content }}<slot></slot></p>
        </div>
    </div>

    <div v-if="prop.character == null"></div>
</template>