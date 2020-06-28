interface IRoom {
    id: string,
    users: User[],
    gamePrompts: {[round: number]: GamePrompt[]},
    gameStarted: boolean,
    round: number,
    points: Points,
    previousRoundPoints: Points,
    pointsValue: number,
    bonusValue: number,
    roundMultiplier: number,
    addUser: ({id, name, isHost}: User) => User | undefined;
    removeUser: (id: string) => User | undefined,
    getHost: () => User | undefined,
    getNonHostUsers: () => User[],
    setupGame: () => void,
    getRoundPrompts: () => GamePrompt[] | undefined,
    handleSubmitAnswer: ({ promptId, answer, name }: PromptAnswer) => SocketSubmitAnswerResult,
    handlePlayerVote: ({ prompt, voterName, promptAuthor }: PromptVote) => GamePrompt | null,
    updatePoints: (prompt: GamePrompt) => void
}

interface SocketJoinParams {
    name: string,
    room: string,
    isHost?: boolean
}

interface SocketJoinError {
    nameError: string,
    roomError: string
}

interface SocketSubmitAnswerResult {
    updatedPrompts?: GamePrompt[],
    finishedUser?: string
}

interface User {
    id: string,
    name: string,
    isHost: boolean,
    index?: number
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

interface GamePrompts {
    [round: number]: GamePrompt[]
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

interface FetchPointsCallback {
    fetchedPoints: Points,
    fetchedPreviousPoints: Points
}

export {
    IRoom,
    SocketJoinParams,
    SocketJoinError,
    SocketSubmitAnswerResult,
    User,
    Points,
    GamePrompt,
    GamePrompts,
    PromptAnswer,
    PromptAnswerWithRoom,
    PromptVote,
    PromptVoteWithRoom,
    FetchPointsCallback
}