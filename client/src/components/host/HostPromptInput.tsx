import React, { useContext, useState, useEffect } from 'react';
import UserContext from '../../context/userContext';
import styled, { keyframes } from 'styled-components';

interface StyledUserProps {
    finished?: boolean
}

const HostPromptInput = () => {
    const { socket, room } = useContext(UserContext);
    const [usersInRoom, setUsersInRoom] = useState<string[]>([]);
    const [finishedUsers, setFinishedUsers] = useState<string[]>([]);

    useEffect(() => {
        if (socket) {
            socket.emit('fetchUsersInRoom', room, setUsersInRoom);

            socket.on('userAnsweredAllPrompts', (user: string) => {
                if (finishedUsers.indexOf(user) < 0) {
                    setFinishedUsers(prev => [...prev, user]);
                }
            });

            // cleanup
            return () => {
                socket.off('userAnsweredAllPrompts')
            };
        }
    }, [socket, room, finishedUsers]);

    return (
        <StyledHostPromptInput>
            <Header>Write your answers on your device now!</Header>
            <UsersPlatform>
                <Users>
                    {usersInRoom.map((user,idx) => 
                        <User key={idx} finished={finishedUsers.indexOf(user) >= 0}>
                            {user}
                        </User>
                    )}
                </Users>
            </UsersPlatform>
        </StyledHostPromptInput>
    );
};

const sway = keyframes`
    0% {
        transform: rotate(2deg) translate(7px,0px);
    }
    50% {
        transform: rotate(-2deg) translate(0px,0px);
    }
    100% {
        transform: rotate(2deg) translate(7px,0px);
    }
`;

const StyledHostPromptInput = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
`;

const Header = styled.p`
    font-weight: bold;
    font-size: 30px;
    line-height: 35px;
    margin: 50px 30px;
    text-align: center;
`;

const UsersPlatform = styled.div`
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 0;
    border-bottom: 100px solid #AAA;
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;
    background-clip: content-box;
`;

const Users = styled.div`
    display: flex;
    justify-content: space-around;
    margin-top: -10px;
`;

const User = styled.div`
    height: 60px;
    width: 60px;
    position: relative;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 30px 70px, #abc, #FFF);
    top: ${(props: StyledUserProps) => props.finished ? "-50vh" : "0"};
    transition: top 300ms ease-in-out;
    animation: 1s ease-in-out infinite running ${sway};
    ${(props: StyledUserProps) => !props.finished && `
        &::after {
            content: "";
            position: absolute;
            top: 70px;
            height: 3px;
            width: 30px;
            border-radius: 50%;
            background-color: #777;
            box-shadow: 0 0 5px 5px rgba(0,0,0,0.3);
        }
    `}
    &:nth-child(1) {
        animation-duration: 900ms;
    }
    &:nth-child(2) {
        animation-duration: 800ms;
    }
    &:nth-child(3) {
        animation-duration: 1100ms;
    }
    &:nth-child(4) {
        animation-duration: 1000ms;
    }
    &:nth-child(5) {
        animation-duration: 1200ms;
    }
    &:nth-child(6) {
        animation-duration: 1000ms;
    }
    &:nth-child(7) {
        animation-duration: 900ms;
    }
    &:nth-child(8) {
        animation-duration: 11000ms;
    }
`

export default HostPromptInput;