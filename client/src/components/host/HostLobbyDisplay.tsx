import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface HostLobbyDisplayProps {
    room: string,
    usersInLobby: string[],
    startGame: () => void
}

interface ConditionalLinkProps {
    usersInLobby: string[],
    children: React.ReactNode
}

interface StyledUserProps {
    hasPlayer?: boolean
}

const MAX_PLAYERS = 8;
const HostLobbyDisplay = ({ room, usersInLobby, startGame }: HostLobbyDisplayProps) => {
    const getPlayerByIdx = (idx: number) => usersInLobby && usersInLobby.length > idx ? usersInLobby[idx] : null;
    return (
        <StyledHostLobbyDisplay>
            <GameInfo>
                <GameInfoWrapper>
                    <RoomInfo>Go to jackbox.tv on your mobile device and use the code <RoomCode>{room}</RoomCode></RoomInfo>
                    <Button 
                        disabled={!usersInLobby || usersInLobby.length < 3}
                        onClick={usersInLobby && usersInLobby.length >= 3 ? startGame : e => e.preventDefault()}>
                        <ConditionalLink usersInLobby={usersInLobby}>Start game</ConditionalLink>
                    </Button>
                </GameInfoWrapper>
            </GameInfo> 
            <UsersInfo>
                <Users>
                    {Array(MAX_PLAYERS).fill(null).map((player,idx) => 
                        <User
                            key={idx}
                            hasPlayer={!!getPlayerByIdx(idx)}>
                            {getPlayerByIdx(idx) || "Join"}
                        </User>
                    )}
                </Users>
            </UsersInfo>
        </StyledHostLobbyDisplay>
    );
};

// only redirect to gameplay if > 3 users in lobby
const ConditionalLink = ({ usersInLobby, children }: ConditionalLinkProps) => {
    return usersInLobby && usersInLobby.length >= 3 
        ? <StyledLink to="/host">{children}</StyledLink>
        : <FakeLink>{children}</FakeLink>;
};

const StyledHostLobbyDisplay = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: 18px;
`;

const GameInfo = styled.div`
    height: 100%;
    width: 50%;
    padding: 30px 0 30px 50px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const GameInfoWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const RoomInfo = styled.p`
    color: #333;
    line-height: 40px;
    max-width: 375px;
    font-size: 24px;
`;

const RoomCode = styled.span`
    font-weight: bold;
    font-size: 26px;
    color: #000;
    background-color: rgba(255,255,255,0.6);
    padding: 3px 5px;
    border-radius: 6px;
`;

const Button = styled.button`
    background-color: white;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.5);
    border-radius: 4px;
    border: none;
    margin: 40px 0;
    text-align: center;
    max-width: 200px;
    font-size: 18px;
    pointer-events: ${props => props.disabled ? "none" : "all"};
    opacity: ${props => props.disabled ? "0.4" : "1"};
    &:focus {
        outline: none;
    }
    &:hover {
        cursor: pointer;
    }
    &:active {
        box-shadow: 0 0 2px 0 rgba(0,0,0,0.3);
    }
`;

const StyledLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: #000;
    max-height: 40px;
    max-width: 200px; 
    padding: 7px;
`;

const FakeLink = styled.div`
    padding: 7px;
`;

const UsersInfo = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 50%;
    padding-right: 20px;
`;

const Users = styled.div`
    position: relative;
    width: 100%;
    max-width: 400px;
    height: 400px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
`;

/* arrange users in a circle */
const User = styled.div`
    position: absolute;
    background: radial-gradient(circle at 40px 42px, #EEE, #FFF);
    opacity: ${(props: StyledUserProps) => props.hasPlayer ? "1" : "0.3"};
    height: 60px;
    width: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    &:nth-child(1) {
        top: 0;
        left: calc(50% - 30px);
    }
    &:nth-child(2) {
        top: calc(20% - 30px);
        left: calc(80% - 30px);
    }
    &:nth-child(3) {
        top: calc(20% - 30px);
        left: calc(20% - 30px);
    }
    &:nth-child(4) {
        top: calc(50% - 30px);
        left: calc(100% - 60px);
    }
    &:nth-child(5) {
        top: calc(50% - 30px);
        left: 0;
    }
    &:nth-child(6) {
        top: calc(80% - 30px);
        left: calc(20% - 30px);
    }
    &:nth-child(7) {
        top: calc(100% - 60px);
        left: calc(50% - 30px);
    }
    &:nth-child(8) {
        top: calc(80% - 30px);
        left: calc(80% - 30px);
    }
`;

export default HostLobbyDisplay;