import React, { useState, useContext } from 'react';
import { Link, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import UserContext from '../context/userContext';

interface SocketError {
    roomError?: string,
    nameError?: string
}

const FrontDoor = () => {
    const [nameInput, setNameInput] = useState('');
    const [roomInput, setRoomInput] = useState('');
    const [joinValidated, setJoinValidated] = useState(false);
    const [joinError, setJoinError] = useState({room: '', name: ''});
    
    const { socket, setName, setRoom, setIsHost } = useContext(UserContext);

    const validate = () => {
        let newJoinError = {room: '', name: ''};
        if (!nameInput || !roomInput) {
            if (!nameInput) {
                newJoinError.name = 'You must enter a valid name';
            }
            if (!roomInput) {
                newJoinError.room = 'You must enter a valid room code';
            }
            setJoinError(newJoinError);
        } else if (socket) {
            socket.emit('validateRoomParams', {room: roomInput, name: nameInput}, 
                ({ roomError, nameError }: SocketError) => {
                    if (nameError) {
                        newJoinError = {...newJoinError, name: nameError};
                    } else if (roomError) {
                        newJoinError = {...newJoinError, room: roomError};
                    } else {
                        setJoinValidated(true);
                        return;
                    }
                    setJoinError(newJoinError);
                })
        }
    };

    const bindNameAndRoom = () => {
        setName(nameInput);
        setRoom(roomInput);
    }

    const setNewRoom = () => {
        setRoom(makeNewRoom());
        setIsHost(true);
    }
    
    const ROOM_LENGTH = 4;
    const makeNewRoom = () => {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        let room = '';
        for (let i=0; i<ROOM_LENGTH; i++) {
            room += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        return room.toUpperCase();
    };

    return (
        <StyledFrontDoor>
            <RoomSelection>
                <RoomSelectionSection>
                    <InputHeader>Room Code</InputHeader>
                    <Input 
                        type="text"
                        placeholder="Enter 4-letter code"
                        maxLength={4}
                        onChange={e => setRoomInput(e.target.value.toUpperCase())} />
                    {joinError.room && <ErrorText>{joinError.room}</ErrorText>}

                    <InputHeader>Name</InputHeader>
                    <Input 
                        type="text"
                        placeholder="Enter your name"
                        maxLength={12}
                        onChange={e => setNameInput(e.target.value.toUpperCase())} />
                    {joinError.name && <ErrorText>{joinError.name}</ErrorText>}
                    
                    <Button onClick={bindNameAndRoom}>
                        <FakeLink onClick={validate} >
                            Join Game 
                        </FakeLink>
                    </Button>
                    {joinValidated && <Redirect to={'/lobby'}/>}

                </RoomSelectionSection>

                <SectionPartition />
                
                <RoomSelectionSection>
                    <Button onClick={setNewRoom}> 
                        <StyledLink to={'/lobby'}>
                            Create New Game 
                        </StyledLink>
                    </Button>
                </RoomSelectionSection>

            </RoomSelection>
        </StyledFrontDoor>
    );
};

const StyledFrontDoor = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 100px;
`;

const RoomSelection = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 250px;
`;

const RoomSelectionSection = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    margin: 20px 0;
`;

const SectionPartition = styled.div`
    width: 100%;
    height: 1px;
    background-color: #777;
`;

const InputHeader = styled.p`
    font-size: 20px;
    margin: 5px;
`;

const Input = styled.input`
    font-size: 18px;
    border: 1px solid #999;
    border-radius: 4px;
    padding: 10px;
`;

const ErrorText = styled.p`
    color: #bb0000;
    font-size: 13px;
`;

const Button = styled.button`
    width: 100%;
    font-size: 20px;
    border-radius: 4px;
    border: none;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.5);
    margin: 15px 0;
    &:focus {
        outline: none;
    }
    &:active {
        box-shadow: 0 0 1px 0 rgba(0,0,0,0.5);;
    }
    &:hover {
        cursor: pointer;
    }
`;

const StyledLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: #000;
    padding: 5px;
`;

const FakeLink = styled.div`
    padding: 5px;
`;

export default FrontDoor;