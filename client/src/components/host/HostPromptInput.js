import React, { useContext, useState, useEffect } from 'react';
import UserContext from '../../context/userContext';
import styled from 'styled-components';

const HostPromptInput = () => {
    const { socket, room } = useContext(UserContext);
    const [usersInRoom, setUsersInRoom] = useState([]);
    const [finishedUsers, setFinishedUsers] = useState([]);

    useEffect(() => {
        if (socket) {
            socket.emit('fetchUsersInRoom', room, setUsersInRoom);

            socket.on('userAnsweredAllPrompts', user => {
                if (finishedUsers.indexOf(user) < 0) {
                    setFinishedUsers(prev => [...prev, user]);
                }
            });

            // cleanup
            return () => socket.off('userAnsweredAllPrompts');
        }
    }, [socket, room, finishedUsers]);

    return (
        <StyledHostPromptInput>
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

const StyledHostPromptInput = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
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
    top: ${props => props.finished ? "-50vh" : "0"};
    ${props => !props.finished && `
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
`;

export default HostPromptInput;