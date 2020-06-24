import React from 'react';
import styled from 'styled-components';

const Interstitial = ({round}: { round: number }) => {
    return (
        <StyledInterstitial>
            <Header>Round {round}</Header>
        </StyledInterstitial>
    );
};

const StyledInterstitial = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Header = styled.p`
    font-size: 30px;
    font-weight: bold;
`;

export default Interstitial;