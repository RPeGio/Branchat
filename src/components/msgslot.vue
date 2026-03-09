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
        <div class="bg-blue-100 rounded-lg px-4 py-3 max-w-[70%]">
            <p class="msg msg-ai text-gray-800">{{ prop.content }}<slot></slot></p>
        </div>
    </div>

    <!-- 用户消息示例 -->
    <div v-if="prop.character == 'user'" class="flex justify-end">
        <div class="bg-green-400 text-gray-800 rounded-lg px-4 py-3 max-w-[70%]">
            <p class="msg msg-user text-gray-800">{{ prop.content }}<slot></slot></p>
        </div>
    </div>

    <div v-if="prop.character == null"></div>
</template>