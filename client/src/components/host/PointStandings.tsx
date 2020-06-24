import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../context/userContext';
import { Points } from '../common/interfaces';

const PointStandings = () => {
    const { socket, room, round } = useContext(UserContext);
    const [points, setPoints] = useState<Points>({});
    const [gameEnded, setGameEnded] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.emit('fetchPoints', room, setPoints);
            socket.on('endGame', () => setGameEnded(true));
            
            // cleanup
            return () => {
                socket.off('endGame')
            };
        }
    }, [socket, room]);

    return (
        <div>
            <p>End of Round {round}</p>
            {gameEnded && <p>Game ended</p>}
            {Object.keys(points).map(user => 
                <div key={user}>{user}: {points[user]}</div>
            )}
        </div>
    );
};

export default PointStandings;