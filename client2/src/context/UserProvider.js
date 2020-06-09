import React, { useReducer, useEffect } from 'react';
import UserContext from './userContext';
import io from 'socket.io-client';
import userReducer from './userReducer';

const UserProvider = (props) => {
    const ENDPOINT = 'localhost:5000';
    const socket = io(ENDPOINT);

    const initialState = {
        socket,
        name: '',
        room: '',
        isHost: false
    };

    const [state, dispatch] = useReducer(userReducer, initialState);

    const setName = name => dispatch({type: 'SET_NAME', payload: name});
    const setRoom = room => dispatch({type: 'SET_ROOM', payload: room});
    const setIsHost = isHost => dispatch({type: 'SET_IS_HOST', payload: isHost});

    useEffect(() => {
        return () => {
            if (socket) {
                console.log('disconnecting socket');
                socket.disconnect();
                socket.off();
            }
        }
        //eslint-disable-next-line
    }, []);

    return (
        <UserContext.Provider value={{
            socket: state.socket,
            name: state.name,
            room: state.room,
            isHost: state.isHost,
            setName,
            setRoom,
            setIsHost
        }}>
            {props.children}
        </UserContext.Provider>
    );
};

export default UserProvider;
