import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import UserContext from '../context/userContext';
import styled from 'styled-components';
import HostLobbyDisplay from './host/HostLobbyDisplay';

const Lobby = () => {
    const [usersInLobby, setUsersInLobby] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    
    const { socket, name, room, isHost } = useContext(UserContext);

    // emit start game event from host
    const startGame = () => {
        socket.emit('startGame', { room }, (error) => {
            console.log(error);
        });
    };

    useEffect(() => {
        if (socket) {
            socket.emit('join', { name, room, isHost }, (error) => {
                console.log(error);
            });
        }
    }, [socket, name, room, isHost]);

    useEffect(() => {
        if (socket) {
            socket.on('userJoined', (users) => {
                setUsersInLobby(users.map(user => user.name));
            }); 
    
            socket.on('userLeft', ({name}) => {
                setUsersInLobby(usersInLobby.filter(user => user !== name));
            });

            // non-hosts listen for game start to redirect to Play
            if (!isHost) {
                socket.on('gameStarted', () => setGameStarted(true));
            }
            
            // cleanup
            return () => {
                socket.off('userJoined');
                socket.off('userLeft');
                socket.off('gameStarted');
            }
        }
    }, [usersInLobby, socket, isHost]);

    return (
        gameStarted
            ? <Redirect to="/play" />
            : <LobbyDisplay 
                isHost={isHost}
                room={room}
                usersInLobby={usersInLobby}
                startGame={startGame} />
    );
};

const LobbyDisplay = ({ isHost, room, usersInLobby, startGame }) => {
    return (
        isHost 
            ? <HostLobbyDisplay room={room} usersInLobby={usersInLobby} startGame={startGame} />
            : <Text>Waiting for host to start the game!</Text>
    );
};

const Text = styled.p`
    font-size: 24px;
    padding: 50px 10px;
`;

export default Lobby;