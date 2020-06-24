import { createContext } from 'react';
import { IUserContext } from './interfaces';

const UserContext: React.Context<IUserContext> = createContext<IUserContext>({
    socket: null,
    name: '',
    room: '',
    round: 1,
    isHost: false,
    setName: () => {},
    setRoom: () => {},
    setRound: () => {},
    setIsHost: () => {}
});

export default UserContext;