import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../context/userContext';
import styled, { keyframes } from 'styled-components';
import { Prompt, Votes } from '../common/interfaces/interfaces';

interface HostPromptVotingProps {
    prompt: Prompt
}

interface StyledAnswerProps {
    rotateLeft?: boolean
}

const TIMER_START_VALUE = 10;

const HostPromptVoting = ({ prompt }: HostPromptVotingProps) => {
    const { socket, room } = useContext(UserContext);
    const [votes, setVotes] = useState<Votes>({});
    const [timerValue, setTimerValue] = useState(TIMER_START_VALUE);

    useEffect(() => {
        setVotes({});
        setTimerValue(TIMER_START_VALUE);
    }, [prompt]);

    useEffect(() => {
        if (socket) {
            socket.on('playerVotes', (playerVotes: Votes) => {
                setVotes(playerVotes);
                setTimerValue(-1);
            });
            socket.emit('answersShown', { prompt, room });
            
            return () => {
                socket.off('playerVotes');
            };
        }
        // reset votes for new prompts
        setVotes({});
    }, [socket, prompt, room]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (timerValue > 0) {
                setTimerValue(prevValue => prevValue - 1);
            } else if (timerValue === 0) {
                if (socket) {
                    socket.emit('voteTimerEnded', { room, promptId: prompt.id });
                }
            }
        }, 1000);

        return () => {
            clearTimeout(timer);
        }
    }, [timerValue, socket, room, prompt]);

    return (
        <StyledHostPromptVoting>
            {timerValue >= 0 && <Timer>{timerValue}</Timer>}
            <PromptText>{prompt.prompt}</PromptText>
            <Answers>
                {prompt.users.map((author,idx) => 
                    <Answer key={idx} rotateLeft={idx === 0}>
                        {votes[author] && <Author>{author}</Author>}
                        <AnswerText>{prompt.answers[author] || ""}</AnswerText>
                        <StyledVotes>
                            {votes[author] && votes[author].map((voter, idx) => 
                                <Vote key={idx}>
                                    {voter}
                                </Vote>
                            )}
                        </StyledVotes>
                    </Answer>
                )}
            </Answers>
        </StyledHostPromptVoting>
    );
};

const zoom = keyframes`
    from {
        transform: scale(0);
    }
    to {
        transform: scale(1);
    }
`;

const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(1800deg);
    }
`;

const fadein = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const StyledHostPromptVoting = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const Timer = styled.div`
    font-size: 21px;
    position: absolute;
    top: 10px;
    left: 10px;
    height: 40px;
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 7px;
    border: 1px solid #000;
    background-color: rgba(255,255,255,0.3);
`;

const PromptText = styled.p`
    font-size: 30px;
    text-align: center;
    margin-bottom: 30px;
    animation: ${zoom} 500ms ease-in-out;
`;

const Answers = styled.div`
    display: flex;
`;

const Answer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 150px;
    width: 300px;
    background-color: white;
    border-radius: 6px;
    font-size: 22px;
    margin: 40px;
    box-shadow: 0px 2px 4px 0 rgba(0,0,0,0.5);
    transform: ${(props: StyledAnswerProps) => props.rotateLeft ? "rotate(-5deg)" : "rotate(5deg)"};
`;

const Author = styled.p`
    position: absolute;
    top: 5px;
    color: teal;
    font-size: 20px;
    animation: ${spin} 500ms ease-in-out;
`;

const AnswerText = styled.p`
`;

const StyledVotes = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
    position: absolute;
    bottom: 10px;
`;

const Vote = styled.div`
    padding: 2px;
    margin: 2px 4px;
    border: 1px solid #777;
    border-radius: 4px;
    font-size: 15px;
    animation: ${fadein} 500ms ease-in-out;
`;

export default HostPromptVoting;