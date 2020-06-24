import { UserProviderState } from './interfaces';
import { UserProviderAction } from './interfaces';

export default (state: UserProviderState, action: UserProviderAction) => {
    switch (action.type) {
        case 'SET_NAME':
            return {
                ...state,
                name: action.payload
            };
        case 'SET_ROOM':
            return {
                ...state,
                room: action.payload
            };
        case 'SET_ROUND':
            return {
                ...state,
                round: action.payload
            };
        case 'SET_IS_HOST':
            return {
                ...state,
                isHost: action.payload
            };
        default:
            return state;
    }
}