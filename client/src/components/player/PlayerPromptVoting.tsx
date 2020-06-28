import React, { useContext, useState, useEffect } from 'react';
import UserContext from '../../context/userContext';
import styled from 'styled-components';
import { Prompt } from '../common/interfaces/interfaces';

interface PlayerPromptVotingProps {
    prompt: Prompt
}

interface PromptVotingDisplayProps {
    prompt: Prompt,
    submitVote: (author: string) => void
}

const PlayerPromptVoting = ({ prompt }: PlayerPromptVotingProps) => {
    const { socket, name, room } = useContext(UserContext); 
    const [playerAnsweredPrompt, setPlayerAnsweredPrompt] = useState(false);
    const [playerVoted, setPlayerVoted] = useState(false);

    useEffect(() => {
        setPlayerAnsweredPrompt(
            !!prompt 
            && !!prompt.users 
            && !!prompt.users.length 
            && prompt.users.includes(name)
        )
        setPlayerVoted(false);
    }, [prompt, name]);

    const submitVote = (promptAuthor: string) => {
        if (socket) {
            socket.emit('playerPromptVote', {
                prompt,
                room,
                voterName: name,
                promptAuthor
            }, () => setPlayerVoted(true));
        }
    };

    return (
        <StyledPlayerPromptVoting> 
            {playerAnsweredPrompt || playerVoted
                ? <Text>Waiting for other players to vote</Text>
                : <PromptVotingDisplay prompt={prompt} submitVote={submitVote} />
            }
        </StyledPlayerPromptVoting>
    );
};

const PromptVotingDisplay = ({ prompt, submitVote }: PromptVotingDisplayProps) => {
    return (
        <StyledPromptVotingDisplay>
            <Text>{prompt.prompt}</Text>
            {prompt.users.map((user, idx) => 
                <Button key={idx} onClick={() => submitVote(user)}>
                    {prompt.answers[user] || ""}
                </Button>
            )}
        </StyledPromptVotingDisplay>
    );
};

const StyledPlayerPromptVoting = styled.div`
    display: flex;
    justify-content: center;
`;

const StyledPromptVotingDisplay = styled.div`
    display: flex;
    flex-direction: column;
    width: 90%;
    max-width: 500px;
`;

const Button = styled.button`
    border: none;
    min-height: 42px;
    border-radius: 4px;
    padding: 10px;
    margin: 10px;
    background-color: #FFF;
    font-size: 18px;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.5);
    &:focus {
        outline: none;
    }
    &:active {
        box-shadow: 0 0 1px 0 rgba(0,0,0,0.5)
    }
`;

const Text = styled.p`
    font-size: 20px;
    padding: 30px 10px;
    text-align: center;
`;

export default PlayerPromptVoting;