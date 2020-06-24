import React, { useState, useEffect, useContext, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import UserContext from '../context/userContext';
import styled from 'styled-components';
import HostLobbyDisplay from './host/HostLobbyDisplay';
import { User } from './common/interfaces';

interface LobbyDisplayProps {
    isHost: boolean, 
    room: string, 
    usersInLobby: string[], 
    startGame: () => void
}

const Lobby = () => {
    const [usersInLobby, setUsersInLobby] = useState<string[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [redirectHome, setRedirectHome] = useState(false);
    
    const { socket, name, room, isHost } = useContext(UserContext);

    // emit start game event from host
    const startGame = () => {
        if (socket) {
            socket.emit('startGame', room);
        }
    };

    useEffect(() => {
        if (socket) {
            socket.emit('join', { name, room, isHost }, () => setRedirectHome(true));
        }
    }, [socket, name, room, isHost]);

    useEffect(() => {
        if (socket) {
            socket.on('userJoined', (users: User[]) => {
                setUsersInLobby(users.map(user => user.name));
            }); 
    
            socket.on('userLeft', ({name}: { name: string }) => {
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
        <Fragment>
            {gameStarted
                ? <Redirect to="/play" />
                : <LobbyDisplay 
                    isHost={isHost}
                    room={room}
                    usersInLobby={usersInLobby}
                    startGame={startGame} />
            }
            {redirectHome && <Redirect to="/" />}
        </Fragment>
    );
};

const LobbyDisplay = ({ isHost, room, usersInLobby, startGame }: LobbyDisplayProps) => {
    return (
        isHost 
            ? <HostLobbyDisplay room={room} usersInLobby={usersInLobby} startGame={startGame} />
            : <Text>Waiting for host to start the game!</Text>
    );
};

const Text = styled.p`
    font-size: 24px;
    padding: 50px 10px;
    text-align: center;
`;

export default Lobby;