export interface ai_prompt {
    chunk: string,
    stream: boolean,
}

export interface user_input {
    isOption: boolean,
    msg?: string,
    history: Array<string>[]
}