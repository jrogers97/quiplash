export default (state, action) => {
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
        case 'SET_IS_HOST':
            return {
                ...state,
                isHost: action.payload
            }
        default:
            return state;
    }
}