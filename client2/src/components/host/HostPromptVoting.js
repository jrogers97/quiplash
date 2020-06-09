import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../context/userContext';
import styled from 'styled-components';

const HostPromptVoting = ({ prompt }) => {
    const { socket, room } = useContext(UserContext);
    const [votes, setVotes] = useState({});

    useEffect(() => {
        if (socket) {
            socket.on('playerVotes', setVotes);
            socket.emit('answersShown', { prompt, room });
        }
        // reset votes for new prompts
        setVotes({});
        // cleanup
        return () => {
            socket.off('playerVotes');
        };
    }, [socket, prompt, room]);

    return (
        <StyledHostPromptVoting>
            <PromptText>{prompt.prompt}</PromptText>
            <Answers>
                {Object.keys(prompt.answers).map((author,idx) => 
                    <Answer key={idx} rotateLeft={idx === 0}>
                        <Author>{votes[author] ? author : ""}</Author>
                        <AnswerText>{prompt.answers[author]}</AnswerText>
                        <Votes>
                            {votes[author] && votes[author].map((voter, idx) => 
                                <Vote key={idx}>
                                    {voter}
                                </Vote>
                            )}
                        </Votes>
                    </Answer>
                )}
            </Answers>
        </StyledHostPromptVoting>
    );
};

const StyledHostPromptVoting = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const PromptText = styled.p`
    font-size: 30px;
    text-align: center;
    margin-bottom: 30px;
`;

const Answers = styled.div`
    display: flex;
`;

const Answer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */
    height: 150px;
    width: 300px;
    background-color: white;
    border-radius: 6px;
    font-size: 22px;
    margin: 40px;
    box-shadow: 0px 2px 4px 0 rgba(0,0,0,0.5);
    transform: ${props => props.rotateLeft ? "rotate(-5deg)" : "rotate(5deg)"};
`;

const Author = styled.p`
    position: absolute;
    top: 5px;
    color: teal;
    font-size: 20px;
`;

const AnswerText = styled.p`
    margin-top: 50px;
`;

const Votes = styled.div`
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
`;

export default HostPromptVoting;