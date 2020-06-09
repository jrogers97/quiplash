import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../../context/userContext';
import HostPromptVoting from './HostPromptVoting';
import HostPromptInput from './HostPromptInput';
import PointStandings from './PointStandings';
import styled from 'styled-components';

const HostGame = () => {
    const { socket } = useContext(UserContext);
    const [answeredPrompts, setAnsweredPrompts] = useState([]);
    const [activePromptIndex, setActivePromptIndex] = useState(0);
    const [allPromptsVoted, setAllPromptsVoted] = useState(false);

    useEffect(() => {
        const setNextActivePrompt = () => {
            if (activePromptIndex < answeredPrompts.length - 1) {
                setActivePromptIndex(activePromptIndex + 1);
            } else {
                setAllPromptsVoted(true);
            }
        };

        if (socket) {
            socket.on('answers', data => {
                if (data.length) {
                    setAnsweredPrompts(data);
                }
            });

            socket.on('nextPromptVoting', setNextActivePrompt);
        }

        // cleanup
        return () => {
            socket.off('answers');
            socket.off('nextPromptVoting');
        };
    }, [socket, activePromptIndex, answeredPrompts]);

    return (
        <StyledHostGame>
            {answeredPrompts.length && activePromptIndex < answeredPrompts.length
                ? <PromptVotingDisplay 
                    prompt={answeredPrompts[activePromptIndex]}
                    allPromptsVoted={allPromptsVoted} />
                : <HostPromptInput />
            }
        </StyledHostGame>
    );
};

const PromptVotingDisplay = ({ prompt, allPromptsVoted}) => {
    return (
        <StyledPromptVotingDisplay>
            {allPromptsVoted 
                ? <PointStandings />
                : <HostPromptVoting prompt={prompt} />
            }
        </StyledPromptVotingDisplay>
    );
};

const StyledHostGame = styled.div`
    width: 100%;
    height: 100%;
`;

const StyledPromptVotingDisplay = styled.div`
    height: 100%;
    width: 100%;
`;

export default HostGame;