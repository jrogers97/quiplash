import { HostState, HostStateAction } from '../interfaces/interfaces';

export default (state: HostState, action: HostStateAction) => {
    switch(action.type) {
        case 'SET_INITIAL_STATE':
            return {
                answeredPrompts: [],
                activePromptIndex: 0,
                allPromptsVoted: false
            };
        case 'SET_NEXT_ACTIVE_PROMPT':
            const promptsRemaining = state.activePromptIndex < state.answeredPrompts.length - 1;
            return {
                ...state,
                activePromptIndex: promptsRemaining ? state.activePromptIndex + 1 : state.activePromptIndex,
                allPromptsVoted: promptsRemaining ? false : true 
            };
        case 'SET_ANSWERED_PROMPTS':
            return {
                ...state,
                answeredPrompts: action.payload
            };
        default:
            return state;
    }
};