export interface User {
    id: string,
    name: string,
    isHost: boolean
}

export interface Points {
    [key: string]: number
}

export interface Answers {
    [key: string]: string[]
}

export interface Votes {
    [key: string]: string[]
}

export interface Prompt {
    id: number,
    prompt: string,
    answers: Answers,
    users: string[],
    votes: Votes
}