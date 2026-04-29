export interface BalanceMessage {
    available: boolean,
    balance: string | null,
    currency: string | null,
}

export interface HistoryItem {
    id: number,
    title: string,
    date: string,
    config: ModelParamsForServer,
    contexts: ContextItem[],
}

export interface ContextItem {
    role: 'user' | 'assistant' | 'system',
    content: string,
    option?: OptionItem,
    selection?: 0 | 1,
}

export interface GlobalUserConfig {
    globalSystemPrompt: string,
}

export interface ConfigItem {
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    topP: number,
    frequencyPenalty: number,
}

export interface ModelParamsForServer {
    temperature: number,
    max_tokens: number,
    top_p: number,
    frequency_penalty: number,
}

export interface OptionItem {
    raw: string | null,
    positive: string | null,
    positiveExtraInput: boolean,
    negative: string | null,
    negativeExtraInput: boolean,
}

export interface MessageItem {
    id: number,
    role: 'user' | 'assistant' | 'system',
    content: string,
    htmlContent?: string,
    option?: OptionItem,
    selection?: 0 | 1,
}

export enum models {
    pro = 'pro',
    flash = 'flash',
}