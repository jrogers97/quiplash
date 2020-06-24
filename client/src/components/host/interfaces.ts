import { Prompt } from '../common/interfaces';

export interface HostState {
    answeredPrompts: Prompt[],
    activePromptIndex: number,
    allPromptsVoted: boolean
}

export enum HostStateActionType {
    SET_INITIAL_STATE = "SET_INITIAL_STATE",
    SET_NEXT_ACTIVE_PROMPT = "SET_NEXT_ACTIVE_PROMPT",
    SET_ANSWERED_PROMPTS = "SET_ANSWERED_PROMPTS"
}

export type HostStateAction = 
      { type: HostStateActionType.SET_INITIAL_STATE }
    | { type: HostStateActionType.SET_NEXT_ACTIVE_PROMPT }
    | { type: HostStateActionType.SET_ANSWERED_PROMPTS, payload: Prompt[]}