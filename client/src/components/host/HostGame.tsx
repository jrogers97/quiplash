import React, { useState, useEffect, useContext, useReducer, Fragment } from 'react';
import {Redirect} from 'react-router-dom';
import UserContext from '../../context/userContext';
import hostReducer from './reducers/hostReducer';
import HostPromptVoting from './HostPromptVoting';
import HostPromptInput from './HostPromptInput';
import Interstitial from './Interstitial';
import PointStandings from './PointStandings';
import styled from 'styled-components';
import { Prompt } from '../common/interfaces';
import { HostState, HostStateAction, HostStateActionType } from './interfaces';

interface PromptVotingDisplayProps {
    prompt: Prompt,
    allPromptsVoted: boolean
}

interface PromptInputDisplayProps {
    showInterstitial: boolean,
    round: number
}   

const HostGame = () => {
    const { socket, room, round, setRound } = useContext(UserContext);
    const [showInterstitial, setShowInterstitial] = useState(true);
    // if user reloads page and loses context, redirect back to front door
    const [redirectHome, setRedirectHome] = useState(false);

    const initialHostState: HostState = {
        answeredPrompts: [],
        activePromptIndex: 0,
        allPromptsVoted: false
    };
    const [hostState, dispatch] = useReducer<React.Reducer<HostState, HostStateAction>>(hostReducer, initialHostState);

    useEffect(() => {
        if (!room) {
            setRedirectHome(true);
        }

        if (socket) {
            // receive answered prompts
            socket.on('answers', (data: Prompt[]) => {
                if (data.length) {
                    dispatch({type: HostStateActionType.SET_ANSWERED_PROMPTS, payload: data});
                }
            });

            // move to next prompt voting
            socket.on('nextPromptVoting', () => dispatch({type: HostStateActionType.SET_NEXT_ACTIVE_PROMPT}));

            // show interstitial before moving to next round
            socket.on('interstitial', (round: number) => {
                dispatch({type: HostStateActionType.SET_INITIAL_STATE});
                setRound(round);
                setShowInterstitial(true);
            });

            // remove interstitial and start new round
            socket.on('startNewRound', () => {
                setShowInterstitial(false);
            });

            // cleanup
            return () => {
                socket.off('answers');
                socket.off('nextPromptVoting');
                socket.off('interstitial');
                socket.off('startNewRound');
            };
        }

    }, [socket, room, hostState.activePromptIndex, hostState.answeredPrompts, setRound]);

    return (
        <StyledHostGame>
            {hostState.answeredPrompts.length && hostState.activePromptIndex < hostState.answeredPrompts.length
                ? <PromptVotingDisplay 
                    prompt={hostState.answeredPrompts[hostState.activePromptIndex]}
                    allPromptsVoted={hostState.allPromptsVoted} />
                : <PromptInputDisplay showInterstitial={showInterstitial} round={round} />
            }
            
            {redirectHome && <Redirect to="/" />}
        </StyledHostGame>
    );
};

const PromptVotingDisplay = ({ prompt, allPromptsVoted}: PromptVotingDisplayProps) => {
    return (
        <StyledPromptVotingDisplay>
            {allPromptsVoted 
                ? <PointStandings />
                : <HostPromptVoting prompt={prompt} />
            }
        </StyledPromptVotingDisplay>
    );
};

const PromptInputDisplay = ({showInterstitial, round}: PromptInputDisplayProps) => {
    return (
        <Fragment>
            {showInterstitial 
                ? <Interstitial round={round} />
                : <HostPromptInput />
            }
        </Fragment>
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