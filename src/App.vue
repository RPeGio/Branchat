<script setup lang="ts">
import { onBeforeMount, ref, watch, nextTick } from 'vue';
import History from './components/History.vue';
import UserConfig from './components/UserConfig.vue';
import OptionSelection from './components/OptionSelection.vue';
import type { BalanceMessage, HistoryItem, ContextItem, GlobalUserConfig, ConfigItem, ModelParamsForServer, OptionItem } from './data/types'
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Store } from '@tauri-apps/plugin-store';
import { processMarkdown } from './utils/markdownRenderer/processor';

const showHistory = ref(false);
const showConfig = ref(false);
const defaultUserConfig: ConfigItem = {
    systemPrompt: '',
    temperature: 1,
    maxTokens: 4000,
    topP: 0.9,
    frequencyPenalty: 0.5
};
const userConfig = ref<ConfigItem>({
    systemPrompt: defaultUserConfig.systemPrompt,
    temperature: defaultUserConfig.temperature,
    maxTokens: defaultUserConfig.maxTokens,
    topP: defaultUserConfig.topP,
    frequencyPenalty: defaultUserConfig.frequencyPenalty
});
const currentId = ref<number | null>(null);
const isSending = ref<boolean>(false);
const markdownRawLines = ref<string>('');
const isTokenVisible = ref<boolean>(false);
const bearerToken = ref<string>('');
const tokenDisplayForm = ref<string>('password');
const currentCharacter = ref<string | null>(null);
const defaultSystemPrompt = '你是一个得力的助手';
const globalSystemPrompt = ref<string>(`${defaultSystemPrompt}`);
const isFirstMessageSent = ref<boolean>(false); // 首条消息有没有被发送
const scrollContainer = ref<HTMLDivElement | null>(null);
const autoScroll = ref<boolean>(true);
const isGivenOptions = ref<boolean>(false);
const options = ref<OptionItem>({
    raw: null,
    positive: null,
    positiveExtraInput: false,
    negative: null,
    negativeExtraInput: false,
});

onBeforeMount(async () => {
    const store = await Store.load('store.json', {
        autoSave: true, defaults: {
            'bearerToken': '',
            'history': [],
            'globalUserConfig': {
                'globalSystemPrompt': `${defaultSystemPrompt}`,
            }
        }
    });
    bearerToken.value = await store.get('bearerToken') || '';
    if (!bearerToken.value) {
        bearerToken.value = import.meta.env.VITE_API_KEY || '';
        await store.set('bearerToken', bearerToken.value);
    }

    const globalConfig = await store.get('globalUserConfig') as GlobalUserConfig;
    if (globalConfig) {
        globalSystemPrompt.value = globalConfig.globalSystemPrompt;
    }
})

// 处理背景遮罩点击事件
const panelClose = async () => {
    await (await Store.load('store.json')).set('globalUserConfig', {
        globalSystemPrompt: globalSystemPrompt.value,
    } as GlobalUserConfig),
    showHistory.value = false;
    showConfig.value = false;
};

const handleScroll = (event: Event): void => {
    const el = scrollContainer.value;
    if (!el) return;
    
    const target = event.currentTarget as HTMLDivElement;
    // console.log(target);
    // console.log(target.scrollHeight, target.scrollTop, target.clientHeight);
    const isAtBottom: boolean = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    autoScroll.value = isAtBottom;
};

const loadHistoryToApp = async (item: HistoryItem) => {
    console.log('加载历史记录:', item);
    const title = item.title;
    const contexts = item.contexts;
    const msgContainer = document.getElementById("message-container") as HTMLElement;
    if (msgContainer) {
        msgContainer.innerHTML = '';
        for (const msg of contexts) {
            // console.log(msg);
            if (msg.role === 'user') {
                let node = document.createElement('div');
                node.innerHTML = `
                    <div class="flex justify-end">
                        <div class="bg-green-400 text-gray-800 rounded-lg px-4 py-3 max-w-[70%]">
                            <div class="msg msg-user text-gray-800 !select-text">${msg.content}</div>
                        </div>
                    </div>
                `;
                msgContainer.appendChild(node);
            } else if (msg.role === 'assistant') {
                const parsedElement = await processMarkdown(msg.content);
                let node = document.createElement('div');
                node.innerHTML = `
                    <div class="flex justify-start">
                        <div class="bg-blue-100 rounded-lg px-4 py-3 max-w-[70%]">
                            <div class="msg msg-ai text-gray-800 [&_*]:!select-text">${parsedElement}</div>
                        </div>
                    </div>
                `;
                msgContainer.appendChild(node);
            }
        }
        currentId.value = item.id;
    }
    if (title) {
        const titleElement = document.getElementById('titlebar-title-text') as HTMLElement;
        titleElement.innerText = title;
    }
    isFirstMessageSent.value = true;
    const config: ConfigItem = {
        systemPrompt: item.contexts[0].content || defaultSystemPrompt,
        temperature: item.config.temperature,
        maxTokens: item.config.max_tokens,
        topP: item.config.top_p,
        frequencyPenalty: item.config.frequency_penalty
    };
    userConfig.value = config;
};

function setCurrentSystemPrompt(): string {
    if (!userConfig.value.systemPrompt) {
        if (!globalSystemPrompt.value)
            return defaultSystemPrompt;
        return globalSystemPrompt.value;
    }
    return userConfig.value.systemPrompt;
}

function getModelConfig(userConfig: ConfigItem): ModelParamsForServer {
    return {
        temperature: userConfig.temperature,
        max_tokens: userConfig.maxTokens,
        top_p: userConfig.topP,
        frequency_penalty: userConfig.frequencyPenalty,
    }
}

function extractOptions(raw: string | null): OptionItem | null {
    if (!raw) return null;
    console.log('原始选项数据:', raw);
    const regex = /^\[(.*?)[,，](true|false)\]\[(.*?)[,，](true|false)\]$/;
    const match = raw.match(regex);
    console.log('正则匹配结果:', match);

    if (match) {
        const result = {
            raw: raw,
            positive: match[1].trim(),
            positiveExtraInput: match[2] === 'true',
            negative: match[3].trim(),
            negativeExtraInput: match[4] === 'true',
        };
        console.log('解析后的选项:', result);
        return result;
    }

    return null;
}

function handleOptionSelection(selectedOption: string) {
    console.log('用户选择了:', selectedOption);
    const inputElement = getInputElement();
    if (inputElement) {
        inputElement.value = selectedOption;
        send_msg();
    }
    isGivenOptions.value = false;
    options.value = {
        raw: null,
        positive: null,
        positiveExtraInput: false,
        negative: null,
        negativeExtraInput: false,
    };
}

function handleOptionClose() {
    isGivenOptions.value = false;
    options.value = {
        raw: null,
        positive: null,
        positiveExtraInput: false,
        negative: null,
        negativeExtraInput: false,
    };
}

function collectContexts(): ContextItem[] {

    const contexts: ContextItem[] = [
        {
            // 'content': '你是一个测试用AI，你需要用尽可能短的输出（markdown仅可使用粗体，斜体，代码块，header，其余均严厉禁止使用）来减少token用量，以方便程序员测试',
            'content': `${setCurrentSystemPrompt()}`,
            // 'content': '你是一只兽耳猫娘，与你的男性主人住在一起，性格偏内向但是很抖M，穿着暴露且性感，你需要时刻勾引你的主人注意自己的身体并一步步勾引主人与你发生关系。多使用动作描写，避免用词隐晦，在体现出内向性格的同时也展现一点开放。',
            'role': 'system',
        },
        {
            'content': '请在正文输出结束后，[DONE]输出之前输出一个空行(不要输出[DONE]!!!)，然后再开一行视情况按如下要求输出：如果你认为当前对话需要用户做出选择/判断，则在一个chunk内输出“@*@”，然后换行，输出“[<正向选项>, true||false（如果需要用户输入补充细节则为true，否则为false）][<反向选项>， true||false（如果需要用户输入补充细节则为true，否则为false）]”；如果你认为不需要，则在一个chunk内输出“@@@”。如果遇到需要解释复杂问题的情况，请将问题拆分成较小的子问题，然后依照前面的格式询问用户是否已理解',
            'role': 'system',
        }
    ];

    const msgElements = document.querySelectorAll<HTMLElement>(".msg");
    // console.log(msgElements);
    msgElements.forEach((element) => {
        const role = element.classList.contains('msg-ai') ? 'assistant' : 'user';
        contexts.push({
            'content': `${element.innerText}`,
            'role': `${role}`,
        });
    });
    return contexts;
}

function getInputElement(): HTMLInputElement {
    return document.querySelector('input[placeholder="输入您的问题/指令..."]') as HTMLInputElement;
}

function textareaEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !isSending.value) {
        send_msg();
    }
}

function emptyInput() {
    const inputElement = getInputElement();
    inputElement.value = '';
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

async function updateHistory(userInput: string, title?: string) {
    const store = await Store.load('store.json');
    const history: HistoryItem[] = await store.get('history') || [];
    const historyLength = history.length;
    const currentHistoryIndex = history.findIndex(h => h.id === currentId.value);
    const modelConfig = getModelConfig(userConfig.value); 

    if (title) {
        const contexts: ContextItem[] = [
            {
                // 'content': '你是一个测试用AI，你需要用尽可能短的输出（markdown仅可使用粗体，斜体，代码块，header，其余均严厉禁止使用）来减少token用量，以方便程序员测试',
                'content': `${setCurrentSystemPrompt()}`,
                // 'content': '你是一只兽耳猫娘，与你的男性主人住在一起，性格偏内向但是很抖M，穿着暴露且性感，你需要时刻勾引你的主人注意自己的身体并一步步勾引主人与你发生关系。多使用动作描写，避免用词隐晦，在体现出内向性格的同时也展现一点开放。',
                'role': 'system',
            },
            {
                'content': '请在正文输出结束后，[DONE]输出之前输出一个空行(不要输出[DONE]!!!)，然后再开一行视情况按如下要求输出：如果你认为当前对话需要用户做出选择/判断，则在一个chunk内输出“@*@”，然后换行，输出“[<正向选项>, true||false（如果需要用户输入补充细节则为true，否则为false）][<反向选项>， true||false（如果需要用户输入补充细节则为true，否则为false）]”；如果你认为不需要，则在一个chunk内输出“@@@”。如果遇到需要解释复杂问题的情况，请将问题拆分成较小的子问题，然后依照前面的格式询问用户是否已理解。选项的字数最好不要超过10字，最多不得超过15字',
                'role': 'system',
            },
            {
                role: 'user',
                content: userInput,
            },
            {
                role: 'assistant',
                content: markdownRawLines.value,
            }
        ];
        // console.log(contexts);
        history.push({
            'id': historyLength,
            'title': title,
            'date': formatDate(new Date(Date.now())),
            'config': modelConfig,
            'contexts': contexts,
        });
        currentId.value = historyLength;
    } else {
        const contexts: ContextItem[] = [
            {
                role: 'user',
                content: userInput,
            },
            {
                role: 'assistant',
                content: markdownRawLines.value,
            }
        ];
        history[currentHistoryIndex].config = modelConfig;
        history[currentHistoryIndex].contexts = history[currentHistoryIndex].contexts.concat(contexts);
    }
    await store.set('history', history);
    // console.log(history);
}

async function clearHistory() {
    const store = await Store.load('store.json');
    await store.set('history', []);
}

const historyItems = ref<HistoryItem[]>([]);
async function loadHistoryItems() {
    const store = await Store.load('store.json');
    historyItems.value = await store.get('history') || [];
}

function createNewConversation() {
    const msgContainer = document.getElementById("message-container");
    if (msgContainer) msgContainer.innerHTML = '';
    userConfig.value = {
        systemPrompt: defaultUserConfig.systemPrompt,
        temperature: defaultUserConfig.temperature,
        maxTokens: defaultUserConfig.maxTokens,
        topP: defaultUserConfig.topP,
        frequencyPenalty: defaultUserConfig.frequencyPenalty
    };
    // console.log(defaultUserConfig);
    isFirstMessageSent.value = false;
    setTitle('分支式AIChat');
}

function setTitle(title: string) {
    const titleElement = document.getElementById('titlebar-title-text') as HTMLElement;
    titleElement.innerText = title;
}

async function send_msg() {
    if (isSending.value) return;
    const inputElement = getInputElement();
    const userInput = inputElement?.value || null;
    if (!userInput) return;
    if (userInput == '/displayToken') {
        tokenDisplayForm.value = "text";
        emptyInput();
        return;
    }

    if (userInput == '/hideToken') {
        tokenDisplayForm.value = "password";
        emptyInput();
        return;
    }

    if (userInput == '/balance') {
        await invoke("balance", {
            key: bearerToken.value,
        }).catch((err) => {
            alert(`An error occurs: ${err}`)
        });
        emptyInput();
        return;
    }

    if (userInput == '/clearHistory') {
        await clearHistory().then(() => {
            alert('History cleared successfully');
        }).catch((err) => {
            alert(`An error occurs: ${err}`)
        });
        emptyInput();
        return;
    }
    markdownRawLines.value = '';

    const modelConfig = getModelConfig(userConfig.value);
    // console.log(modelConfig);

    const contexts = collectContexts();

    contexts.push({
        'content': `${userInput}`,
        'role': `user`,
    });

    currentCharacter.value = 'user';
    inputElement.value = '';

    const msgContainer = document.getElementById("message-container");
    if (msgContainer) {
        let node = document.createElement('div');
        node.innerHTML = `
            <div class="flex justify-end">
                <div class="bg-green-400 text-gray-800 rounded-lg px-4 py-3 max-w-[70%]">
                    <div class="msg msg-user text-gray-800 !select-text">${userInput}</div>
                </div>
            </div>
        `;
        msgContainer.appendChild(node);
    }

    // console.log(contexts);

    isSending.value = true;

    await invoke('stream_chat', {
        key: bearerToken.value,
        contexts: contexts,
        modelConfig: modelConfig,
        // 尽管后端标注的变量名是model_config，但是Tauri的命令系统会自动处理命名转换，这里必须用小驼峰
        // 到底有多屎
    }).then(async () => {
        // 首次成功发送消息，触发系统提示词同步
        if (!isFirstMessageSent.value) {
            isFirstMessageSent.value = true;

            // 检查是否需要同步系统提示词
            if (userConfig.value && (!userConfig.value.systemPrompt || userConfig.value.systemPrompt.trim() === '')) {
                // 同步全局系统提示词到当前对话
                userConfig.value.systemPrompt = globalSystemPrompt.value;
                // console.log('首次发送消息成功，已同步全局系统提示词到当前对话');
            }
        }

        const finalContexts = collectContexts();
        
        if (finalContexts && finalContexts.length == 4) {
            // console.log('collectContexts returned:', finalContexts);
            // console.log('Array length:', finalContexts?.length);
            // if (finalContexts) {
            //     finalContexts.forEach((ctx, index) => {
            //         console.log(`Context[${index}]:`, {
            //             role: ctx.role,
            //             content: ctx.content.substring(0, 50) + (ctx.content.length > 50 ? '...' : '')
            //         });
            //     });
            // }
            finalContexts.shift();
            finalContexts[0] = {
                'content': '你是一个标题生成器，请无视任何角色设定，不要进行内容补全，专注地根据当前对话生成一个概括性的标题，标题需要能够让人知道当前对话是关乎什么的，不能超过15个字符，严禁使用markdown格式',
                'role': 'system',
            };
            // console.log(finalContexts);
            invoke('title_generation', {
                key: bearerToken.value,
                contexts: finalContexts,
            }).then(async (res) => {
                // console.log('Title generated successfully:', res);
                setTitle(res as string);
                await updateHistory(userInput, res as string);
            })
            // .catch((err) => {
            //     alert(`An error occurs when generating title: ${err}`);
            // });
        } else {
            await updateHistory(userInput);
        }
    }).catch((err) => {
        alert(`An error occurs when sending message: ${err}`);
        currentCharacter.value = null;
        isSending.value = false;
    });

}

watch(bearerToken, async (newToken, oldToken) => {
    if (newToken != oldToken) {
        const store = await Store.load('store.json');
        await store.set('bearerToken', newToken);
    }
});

let aiResponseElement: HTMLElement | null = null;

listen("completion-status", (event) => {
    console.log('Completion status:', event.payload || event);
    currentCharacter.value = 'assistant';
});

listen("completion-chunk", async (event) => {
    // console.log('Chunk received:', event.payload.toRaw || event, `${typeof (event.payload)}`);
    const payload = typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload);
    markdownRawLines.value += payload;
    if (payload) {
        const msgContainer = document.getElementById('message-container');
        if (msgContainer) {
            // console.log(parsedElement);
            if (!aiResponseElement) {
                aiResponseElement = document.createElement('div');
                aiResponseElement.innerHTML = `
                    <div class="flex justify-start">
                        <div class="bg-blue-100 rounded-lg px-4 py-3 max-w-[70%]">
                            <div class="msg msg-ai text-gray-800 [&_*]:!select-text"></div>
                        </div>
                    </div>
                `;
                msgContainer.appendChild(aiResponseElement);
            } else if (aiResponseElement && (markdownRawLines.value.includes('@*@') || markdownRawLines.value.includes('@@@'))) {
                const pElement = aiResponseElement.querySelector('.msg-ai');
                if (markdownRawLines.value.includes('@*@')) {
                    if (pElement) {
                        if (isGivenOptions.value) {
                            options.value.raw += payload.trim();
                        } else {
                            const cleanMarkdown = markdownRawLines.value.replace('@*@', '');
                            pElement.innerHTML = await processMarkdown(cleanMarkdown);
                            isGivenOptions.value = true;
                            options.value.raw = '';
                        }
                    }
                }
                else if (markdownRawLines.value.includes('@@@')) {
                    if (pElement) {
                        const cleanMarkdown = markdownRawLines.value.replace('@@@', '');
                        pElement.innerHTML = await processMarkdown(cleanMarkdown);
                    }
                }
            } else {
                const pElement = aiResponseElement.querySelector('.msg-ai');
                if (pElement) {
                    pElement.innerHTML = await processMarkdown(markdownRawLines.value);
                }
            }
        }

    }
});

listen("completion-end", (event) => {
    console.log('Completion end:', event.payload || event);
    currentCharacter.value = null;
    aiResponseElement = null;
    isSending.value = false;
    const extractedOption = extractOptions(options.value.raw);
    if (extractedOption) {
        options.value = extractedOption;
        console.log(options.value);
    }
});

listen("balance", (event) => {
    console.log('Balance info:', event.payload);
    const infos = event.payload as BalanceMessage;
    alert(`当前api-key可用性：${infos.available}\n当前剩余余额：${infos.balance} ${infos.currency}`);
});

// 监听消息变化，自动滚动
watch([markdownRawLines, () => markdownRawLines.value.length], async () => {
    if (autoScroll.value) {
        await nextTick(); // 等待 DOM 更新完成
        // console.log('Auto-scrolling to bottom...');
        const el = scrollContainer.value;
        if (el) el.scrollTop = el.scrollHeight;
    }
}, { deep: true });
</script>

<template>
    <div class="h-[calc(100vh-30px-102px)] bg-gray-50 flex flex-col">
        <div ref="scrollContainer" @scroll="handleScroll" class="flex-1 overflow-y-auto p-6 space-y-4" style="scroll-padding-bottom: 1rem;">
            <!-- 空白区域，用于显示新消息 -->
            <div id="message-container" class="space-y-4">
            </div>
        </div>

        <!-- 背景遮罩 -->
        <Transition name="mask" enter-active-class="transition ease-in-out duration-300" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition ease-in-out duration-300"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="showHistory || showConfig" class="fixed inset-0 bg-black/40 z-40" @click="panelClose"></div>
        </Transition>
        <History :isVisible="showHistory" :historyItems="historyItems" @close="panelClose" @load="loadHistoryToApp"
            @new-conversation="createNewConversation" />
        <UserConfig :isVisible="showConfig" v-model:globalSystemPrompt="globalSystemPrompt"
            v-model:userConfig="userConfig" :defaultSystemPrompt="defaultSystemPrompt"
            v-model:isFirstMessageSent="isFirstMessageSent" @close="panelClose" />

        <!-- Token 输入区域 - 可展开/收起 -->
        <div class="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 w-full z-10 opacity-100 h-auto min-h-15"
            v-if="isTokenVisible">
            <div class="w-3/4 mx-auto flex flex-col items-center">
                <div class="w-full flex items-center space-x-3">
                    <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Deepseek Bearer Token:</label>
                    <input :type="tokenDisplayForm" v-model="bearerToken"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="输入您的 API Token" />
                </div>
            </div>
        </div>

        <!-- 输入区域 - 固定在底部 -->
        <div v-show="!isGivenOptions"
            class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-between p-4 pb-9 pt-9 w-full">
            <!-- 左侧按钮容器，继承父级宽度 -->
            <div class="w-3/4 flex space-x-3">
                <!-- 对话历史 - 放置在输入区域内最左端 -->
                <button @click="showHistory = true, loadHistoryItems()"
                    class="w-8 h-8 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center self-center transition-transform duration-200 hover:scale-120">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                </button>
            </div>

            <!-- 中间输入框和发送按钮，居中并浮动在上方 -->
            <div class="absolute left-1/2 transform -translate-x-1/2 flex space-x-3">
                <!-- Token 切换按钮 -->
                <button @click="isTokenVisible = !isTokenVisible"
                    class="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition duration-200 flex items-center justify-center text-sm whitespace-nowrap">
                    <span v-if="isTokenVisible">隐藏 Token</span>
                    <span v-else>显示 Token</span>
                </button>

                <!-- 输入框 -->
                <input type="text" placeholder="输入您的问题/指令..." @keydown="textareaEnter"
                    class="w-lg px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />

                <!-- 发送按钮和角色按钮 - 放在右侧 -->
                <div class="flex space-x-3">
                    <button @click="send_msg" :disabled="isSending"
                        :class="isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'"
                        class="text-white px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center whitespace-nowrap">
                        <svg v-if="!isSending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                        <span v-else>发送中...</span>
                    </button>
                </div>
            </div>

            <!-- 右侧按钮容器，继承父级宽度 -->
            <div class="w-3/4 flex justify-end">
                <!-- 用户配置 - 放置在输入区域内最右端 -->
                <button @click="showConfig = true"
                    class="w-8 h-8 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center self-center transition-transform duration-200 hover:scale-120">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path
                            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                        </path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- 选项选择组件 - 固定在底部 -->
        <OptionSelection 
            v-if="isGivenOptions"
            :raw="options.raw"
            :positive="options.positive"
            :positiveExtraInput="options.positiveExtraInput"
            :negative="options.negative"
            :negativeExtraInput="options.negativeExtraInput"
            @select="handleOptionSelection"
            @close="handleOptionClose"
        />
    </div>
</template>

<style>
@import 'katex/dist/katex.min.css';

.msg-ai {
    line-height: 1.6;
}

/* 基础 Markdown 样式 */
.msg-ai h1 {
    font-size: 1.6em;
    font-weight: bold;
    margin: 0.33em 0;
}

.msg-ai h2 {
    font-size: 1.3em;
    font-weight: bold;
    margin: 0.33em 0;
}

.msg-ai hr {
    color: #393939;
    height: 10px;
    margin: 0.6em 0;
}

.msg-ai p {
    margin: 0.2em 0;
}

.msg-ai pre {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow: auto;
}

.msg-ai code {
    font-family: consolas;
    background-color: rgba(175, 184, 193, 0.2);
    padding: 0.2em 0.4em;
    border-radius: 6px;
}

.msg-ai blockquote {
    border-left: 4px solid #b4b5b5;
    color: #6a737d;
    padding: 0 1em;
    margin: 0 0 1em 0;
}

.msg-ai table {
    border-collapse: collapse;
    width: 100%;
}

.msg-ai th,
.msg-ai td {
    border: 1px solid #dfe2e5;
    padding: 6px 13px;
}

.msg-ai tr {
    background-color: #fff;
    border-top: 1px solid #c6cbd1;
}

.msg-ai tr:nth-child(2n) {
    background-color: #f6f8fa;
}
</style>