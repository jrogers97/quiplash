import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import UserContext from '../context/userContext';

const FrontDoor = () => {
    const [nameInput, setNameInput] = useState('');
    const [roomInput, setRoomInput] = useState('');
    
    const { setName, setRoom, setIsHost } = useContext(UserContext);

    const bindNameAndRoom = () => {
        setName(nameInput);
        setRoom(roomInput.toUpperCase());
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
                        maxLength="4"
                        onChange={e => setRoomInput(e.target.value)} />

                    <InputHeader>Name</InputHeader>
                    <Input 
                        type="text"
                        placeholder="Enter your name"
                        maxLength="12"
                        onChange={e => setNameInput(e.target.value)} />
                    
                    <Button onClick={() => bindNameAndRoom()}>
                        <StyledLink 
                            onClick={e => (!nameInput || !roomInput) ? e.preventDefault() : null}
                            to={`/lobby`}>
                            Join Game 
                        </StyledLink>
                    </Button>

                </RoomSelectionSection>

                <SectionPartition />
                
                <RoomSelectionSection>
                    <Button onClick={() => setNewRoom()}> 
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

export default FrontDoor;