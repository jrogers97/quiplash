import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../../context/userContext';
import PlayerPromptInput from './PlayerPromptInput';
import PlayerPromptVoting from './PlayerPromptVoting';

const PlayerGame = () => {
    const { socket } = useContext(UserContext);
    const [votingStarted, setVotingStarted] = useState(false);
    const [activePrompt, setActivePrompt] = useState(null);

    useEffect(() => {
        if (socket) {
            socket.on('startPlayerVote', (prompt) => {
                setVotingStarted(true);
                setActivePrompt(prompt);
            });
        }

        // cleanup
        return () => socket.off('startPlayerVote');
    }, [socket]);
    
    return (
        <div>
            {votingStarted && activePrompt 
                ? <PlayerPromptVoting prompt={activePrompt} /> 
                : <PlayerPromptInput />
            }
        </div>
    );
};

export default PlayerGame;