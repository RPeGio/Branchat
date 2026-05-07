import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Store } from '@tauri-apps/plugin-store';
import type { HistoryItem, ContextItem, ModelParamsForServer } from '../data/types';

let storePromise: Promise<Store> | null = null;
async function getStore() {
    if (!storePromise) {
        storePromise = Store.load('store.json', {
            autoSave: true, defaults: {
                'bearerToken': '',
                'history': [],
                'globalUserConfig': {},
            }
        });
    }
    return storePromise;
}

export const useHistoryStore = defineStore('history', () => {
    const historyItems = ref<HistoryItem[]>([]);
    const historyCount = ref(0);
    const rawCurrentId = ref<number | null>(null);
    const showHistory = ref(false);
    const showConfig = ref(false);

    const currentId = computed(() => {
        const id = rawCurrentId.value;
        if (id === null || id === -1) return historyCount.value;
        const existsInHistory = historyItems.value.some(h => h.id === id);
        if (!existsInHistory) return historyCount.value;
        return id;
    });

    async function loadFromStore() {
        const store = await getStore();
        const savedHistory: HistoryItem[] = await store.get('history') || [];
        historyItems.value = savedHistory;
        historyCount.value = savedHistory.length;
    }

    async function saveHistoryToStore(history: HistoryItem[]) {
        const store = await getStore();
        await store.set('history', history);
    }

    async function updateHistory(title: string | undefined, modelConfig: ModelParamsForServer, contexts: ContextItem[], _setCurrentSystemPrompt: () => string) {
        const store = await getStore();
        const history: HistoryItem[] = await store.get('history') || [];
        const historyLength = history.length;
        const currentHistoryIndex = history.findIndex(h => h.id === currentId.value);

        if (title) {
            history.push({
                id: historyLength,
                title,
                date: formatDate(new Date(Date.now())),
                config: modelConfig,
                contexts,
            });
            historyCount.value = history.length;
            rawCurrentId.value = historyLength;
        } else {
            if (currentHistoryIndex === -1) return;
            history[currentHistoryIndex].config = modelConfig;
            history[currentHistoryIndex].contexts = contexts;
        }
        await store.set('history', history);
    }

    async function clearHistory() {
        const store = await getStore();
        await store.set('history', []);
        historyItems.value = [];
        historyCount.value = 0;
    }

    async function loadHistoryItems() {
        const store = await getStore();
        historyItems.value = await store.get('history') || [];
        historyCount.value = historyItems.value.length;
    }

    async function deleteHistoryItem(item: HistoryItem) {
        const newHistory = historyItems.value.filter(h => h.id !== item.id);
        for (let i = 0; i < newHistory.length; i++) {
            newHistory[i].id = i;
        }
        historyItems.value = newHistory;
        historyCount.value = newHistory.length;
        await saveHistoryToStore(newHistory);
    }

    async function handleUpdateTitle(item: HistoryItem, newTitle: string) {
        const store = await getStore();
        const history: HistoryItem[] = await store.get('history') || [];
        const idx = history.findIndex(h => h.id === item.id);
        if (idx !== -1) {
            history[idx].title = newTitle;
            await store.set('history', history);
            historyItems.value = history;
        }
    }

    function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    function panelClose() {
        showHistory.value = false;
        showConfig.value = false;
    }

    async function saveCurrentConfig(modelConfig: ModelParamsForServer) {
        const store = await getStore();
        const history: HistoryItem[] = await store.get('history') || [];
        const idx = history.findIndex(h => h.id === currentId.value);
        if (idx !== -1) {
            history[idx].config = modelConfig;
            await store.set('history', history);
            historyItems.value = history;
        }
    }

    return {
        historyItems,
        historyCount,
        rawCurrentId,
        currentId,
        showHistory,
        showConfig,
        loadFromStore,
        saveHistoryToStore,
        updateHistory,
        clearHistory,
        loadHistoryItems,
        deleteHistoryItem,
        handleUpdateTitle,
        panelClose,
        saveCurrentConfig,
    };
});
