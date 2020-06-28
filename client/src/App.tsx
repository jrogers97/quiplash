import React from 'react';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import styled from 'styled-components';

import FrontDoor from './components/common/FrontDoor';
import Lobby from './components/common/Lobby';
import HostGame from './components/host/HostGame';
import PlayerGame from './components/player/PlayerGame';
import UserProvider from './context/UserProvider';

const App: React.FC = () => {
    return (
        <StyledApp>
            <UserProvider>
                <Router>
                    <Switch>
                        <Route path="/" exact component={FrontDoor} />
                        <Route path="/lobby" component={Lobby} />
                        <Route path="/host" component={HostGame} />
                        <Route path="/play" component={PlayerGame} />
                    </Switch>
                </Router>
            </UserProvider>
        </StyledApp>
    );
};

const StyledApp = styled.div`
    height: 100vh;
    width: 100vw;
    margin: auto;
    background: rgb(179,180,146);
    background: linear-gradient(333deg, rgba(216,208,193,1) 40%, rgba(179,180,146,1) 100%);
`;

export default App;
