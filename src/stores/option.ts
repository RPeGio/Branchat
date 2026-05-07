import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { OptionItem } from '../data/types';

const defaultOption: OptionItem = {
    raw: null,
    positive: null,
    positiveExtraInput: false,
    negative: null,
    negativeExtraInput: false,
};

export const useOptionStore = defineStore('option', () => {
    const isGivenOptions = ref(false);
    const startCollectingOptions = ref(false);
    const currentOptionList = ref<(OptionItem | null)[]>([]);
    const options = ref<OptionItem>({ ...defaultOption });

    function resetOptions() {
        options.value = { ...defaultOption };
    }

    function closeOptions() {
        isGivenOptions.value = false;
        resetOptions();
    }

    function setOption(opt: OptionItem) {
        options.value = opt;
    }

    return {
        isGivenOptions,
        startCollectingOptions,
        currentOptionList,
        options,
        resetOptions,
        closeOptions,
        setOption,
    };
});
