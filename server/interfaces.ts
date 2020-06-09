interface IRoom {
    id: string,
    users: User[],
    gamePrompts: GamePrompt[],
    points: Points,
    pointsValue: number,
    bonusValue: number,
    addUser: ({id, name, isHost}: User) => {user?: User, error?: string},
    removeUser: (id: string) => User | undefined,
    getHost: () => User | undefined,
    getNonHostUsers: () => User[],
    setupGamePrompts: () => GamePrompt[],
    handleSubmitAnswer: ({ promptId, answer, name }: PromptAnswer) => SocketSubmitAnswerResult,
    handlePlayerVote: ({ prompt, voterName, promptAuthor }: PromptVote) => GamePrompt | null,
    updatePoints: (prompt: GamePrompt) => void
}

interface SocketJoinParams {
    name: string,
    room: string,
    isHost: boolean
}

interface SocketJoinResult {
    user?: User,
    error?: string
}

interface SocketSubmitAnswerResult {
    updatedPrompts?: GamePrompt[],
    finishedUser?: string
}

interface User {
    id: string,
    name: string,
    isHost: boolean
}

interface Points {
    [key: string]: number
}

interface Answers {
    [key: string]: string
}

interface Votes {
    [key: string]: string[]
}

interface GamePrompt {
    id: number,
    prompt: string,
    answers: Answers,
    users: string[],
    votes: Votes
}

interface PromptAnswer {
    promptId: number,
    answer: string, 
    name: string
}

interface PromptAnswerWithRoom {
    promptId: number,
    answer: string,
    name: string,
    room: string
}

interface PromptVote {
    prompt: GamePrompt,
    voterName: string, 
    promptAuthor: string,
}

interface PromptVoteWithRoom {
    prompt: GamePrompt,
    voterName: string, 
    promptAuthor: string,
    room: string
}

export {
    IRoom,
    SocketJoinParams,
    SocketJoinResult,
    SocketSubmitAnswerResult,
    User,
    Points,
    GamePrompt,
    PromptAnswer,
    PromptAnswerWithRoom,
    PromptVote,
    PromptVoteWithRoom
}