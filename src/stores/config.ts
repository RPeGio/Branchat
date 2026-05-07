import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Store } from '@tauri-apps/plugin-store';
import { models } from '../data/types';
import type { ConfigItem, GlobalUserConfig } from '../data/types';

let storePromise: Promise<Store> | null = null;
async function getStore() {
    if (!storePromise) {
        storePromise = Store.load('store.json', {
            autoSave: true, defaults: {
                'bearerToken': '',
                'history': [],
                'globalUserConfig': {
                    'globalSystemPrompt': '你是一个得力的助手',
                }
            }
        });
    }
    return storePromise;
}

export const defaultUserConfig: ConfigItem = {
    systemPrompt: '',
    temperature: 1,
    maxTokens: 4000,
    topP: 0.9,
    frequencyPenalty: 0.5,
};

export const defaultSystemPrompt = '你是一个得力的助手';

export const useConfigStore = defineStore('config', () => {
    const bearerToken = ref('');
    const model = ref<models>(models.pro);
    const globalSystemPrompt = ref<string>(defaultSystemPrompt);
    const userConfig = ref<ConfigItem>({ ...defaultUserConfig });
    const isFirstMessageSent = ref(false);

    async function loadFromStore() {
        const store = await getStore();
        bearerToken.value = await store.get('bearerToken') || '';
        if (!bearerToken.value) {
            bearerToken.value = import.meta.env.VITE_API_KEY || '';
            await store.set('bearerToken', bearerToken.value);
        }

        const globalConfig = await store.get('globalUserConfig') as GlobalUserConfig | undefined;
        if (globalConfig) {
            globalSystemPrompt.value = globalConfig.globalSystemPrompt;
            model.value = globalConfig.globalmodel;
        }
    }

    async function saveBearerToken() {
        const store = await getStore();
        await store.set('bearerToken', bearerToken.value);
    }

    async function saveGlobalConfig() {
        const store = await getStore();
        await store.set('globalUserConfig', {
            globalSystemPrompt: globalSystemPrompt.value,
            globalmodel: model.value,
        } as GlobalUserConfig);
    }

    function setCurrentSystemPrompt(): string {
        if (!userConfig.value.systemPrompt) {
            if (!globalSystemPrompt.value) return defaultSystemPrompt;
            return globalSystemPrompt.value;
        }
        return userConfig.value.systemPrompt;
    }

    function getModelConfig(): import('../data/types').ModelParamsForServer {
        const c = userConfig.value;
        return {
            temperature: c.temperature,
            max_tokens: c.maxTokens,
            top_p: c.topP,
            frequency_penalty: c.frequencyPenalty,
        };
    }

    function resetUserConfig() {
        userConfig.value = { ...defaultUserConfig };
    }

    return {
        bearerToken,
        model,
        globalSystemPrompt,
        userConfig,
        isFirstMessageSent,
        defaultSystemPrompt,
        loadFromStore,
        saveBearerToken,
        saveGlobalConfig,
        setCurrentSystemPrompt,
        getModelConfig,
        resetUserConfig,
    };
});
