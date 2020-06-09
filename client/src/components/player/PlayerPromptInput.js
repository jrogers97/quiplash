import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../../context/userContext';
import styled from 'styled-components';

const NUM_PROMPTS = 2;

const PlayerPromptInput = () => {
    const { socket, name, room } = useContext(UserContext);
    const [prompts, setPrompts] = useState([]);
    const [answerInput, setAnswerInput] = useState(Array(NUM_PROMPTS).fill(''));
    const [answerSubmitted, setAnswerSubmitted] = useState(Array(NUM_PROMPTS).fill(false));
    
    useEffect(() => {
        // get prompts assigned to specific user
        const parsePrompts = prompts => prompts.filter(prompt => prompt.users.includes(name));

        if (socket) {
            socket.on('prompts', data => setPrompts(parsePrompts(data)));
        }
        
        // cleanup
        return () => {
            socket.off('prompts');
        };
    }, [socket, name]);

    const handleAnswerInput = (value, answerIdx) => {
        let answerInputCopy = answerInput.slice();
        answerInputCopy[answerIdx] = value;
        setAnswerInput(answerInputCopy);
    };

    const handleAnswerSubmitted = (value, answerIdx) => {
        let answerSubmittedCopy = answerSubmitted.slice();
        answerSubmittedCopy[answerIdx] = value;
        setAnswerSubmitted(answerSubmittedCopy);
    }

    const submitAnswer = (answerIdx) => {
        if (answerInput[answerIdx]) {
            socket.emit('submitAnswer', {
                promptId: prompts[answerIdx].id,
                answer: answerInput[answerIdx],
                name,
                room
            }, () => handleAnswerSubmitted(true, answerIdx));
        }
    };

    return (
        <StyledPlayerPromptInput>
            {/* <p>{name} {room}</p> */}
            {prompts.map((prompt, idx) => 
                <PromptWrapper key={idx}>
                    <PromptText>{prompt.prompt}</PromptText>
                    <PromptResponse>
                        <Input 
                            type="text"
                            value={answerInput[idx]}
                            placeholder="Enter your answer"
                            disabled={answerSubmitted[idx]}
                            onChange={e => handleAnswerInput(e.target.value, idx)} />
                        <Button onClick={() => answerSubmitted[idx] ? handleAnswerSubmitted(false, idx) : submitAnswer(idx)}> 
                            {answerSubmitted[idx] ? "Edit" : "Submit"} 
                        </Button>
                    </PromptResponse>
                </PromptWrapper>
            )}
        </StyledPlayerPromptInput>
    );
};

const StyledPlayerPromptInput = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center
`;

const PromptWrapper = styled.div`
    padding: 30px 0;
    margin: 0 30px;
    border-bottom: 1px solid #888;
    width: 90%;
    max-width: 500px;
    &:last-child {
        border-bottom: none;
    }
`;

const PromptText = styled.p`
    font-size: 18px;
`;

const PromptResponse = styled.div`
    display: flex;
    flex-direction: column;
`;

const Input = styled.input`
    width: 100%;
    font-size: 16px;
    margin: 10px 0;
    padding: 7px; 
    border: none;
    border-radius: 4px;
    opacity: ${props => props.disabled ? "0.5" : "1"}; 
`;

const Button = styled.button`
    width: 100%;
    border: none;
    font-size: 18px;
    padding: 6px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.5);
    &:focus {
        outline: none; 
    }
    &:active {
        box-shadow: none;
    }
`;

export default PlayerPromptInput;