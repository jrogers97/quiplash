import React, { useState, useEffect, useContext } from 'react';
import {Redirect} from 'react-router-dom';
import UserContext from '../../context/userContext';
import PlayerPromptInput from './PlayerPromptInput';
import PlayerPromptVoting from './PlayerPromptVoting';
import { Prompt } from '../common/interfaces';

const PlayerGame: React.FC = () => {
    const { socket, name, room, setRound } = useContext(UserContext);
    const [votingStarted, setVotingStarted] = useState(false);
    const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
    // if user reloads page and loses context, redirect back to front door
    const [redirectHome, setRedirectHome] = useState(false);

    useEffect(() => {
        if (!name || !room) {
            setRedirectHome(true);
        }

        if (socket) {
            socket.on('startPlayerVote', (prompt: Prompt) => {
                setVotingStarted(true);
                setActivePrompt(prompt);
            });

            socket.on('startNewRound', (round: number) => {
                setVotingStarted(false);
                setActivePrompt(null);
                setRound(round);
            });
        }

        // cleanup
        return () => {
            if (socket) {
                socket.off('startPlayerVote');
                socket.off('startNewRound');
            }
        };
    }, [socket, name, room, setRound, setRedirectHome]);
    
    return (
        <div>
            {votingStarted && activePrompt 
                ? <PlayerPromptVoting prompt={activePrompt} /> 
                : <PlayerPromptInput />
            }
            {redirectHome && <Redirect to="/" />}
        </div>
    );
};

export default PlayerGame;