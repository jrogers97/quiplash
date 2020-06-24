import React, { useReducer, useEffect } from 'react';
import UserContext from './userContext';
import io from 'socket.io-client';
import userReducer from './userReducer';
import { UserProviderState, UserProviderAction, UserProviderActionType } from './interfaces';

interface UserProviderProps {
    children: React.ReactNode
}

const UserProvider = ({ children }: UserProviderProps) => {
    const ENDPOINT = 'localhost:5000';
    const socket = io(ENDPOINT);

    const initialState: UserProviderState = {
        socket,
        name: '',
        room: '',
        round: 1,
        isHost: false
    };

    const [state, dispatch] = useReducer<React.Reducer<UserProviderState, UserProviderAction>>(userReducer, initialState);

    const setName = (name: string) => dispatch({type: UserProviderActionType.SET_NAME, payload: name});
    const setRoom = (room: string) => dispatch({type: UserProviderActionType.SET_ROOM, payload: room});
    const setRound = (round: number) => dispatch({type: UserProviderActionType.SET_ROUND, payload: round});
    const setIsHost = (isHost: boolean) => dispatch({type: UserProviderActionType.SET_IS_HOST, payload: isHost});

    useEffect(() => {
        return () => {
            if (socket) {
                socket.disconnect();
            }
        }
        //eslint-disable-next-line
    }, []);

    return (
        <UserContext.Provider value={{
            socket: state.socket,
            name: state.name,
            room: state.room,
            round: state.round,
            isHost: state.isHost,
            setName,
            setRoom,
            setRound,
            setIsHost
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
