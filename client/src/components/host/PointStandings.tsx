import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../context/userContext';
import { Points } from '../common/interfaces/interfaces';

interface FetchPointsCallbackProps {
    fetchedPoints: Points,
    fetchedPreviousPoints: Points
}

const PointStandings = () => {
    const { socket, room, round } = useContext(UserContext);
    // standings from last round to show changes
    const [previousPoints, setPreviousPoints] = useState<Points>({});
    const [points, setPoints] = useState<Points>({});
    const [gameEnded, setGameEnded] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.emit('fetchPoints', room, ({ fetchedPoints, fetchedPreviousPoints }: FetchPointsCallbackProps) => {
                setPoints(fetchedPoints);
                if (Object.keys(fetchedPreviousPoints).length) {
                    setPreviousPoints(fetchedPreviousPoints);
                }
            });
            socket.on('endGame', () => setGameEnded(true));
            
            return () => {
                socket.off('endGame')
            };
        }
    }, [socket, room]);

    console.log('current: ', points);
    console.log('prev: ', previousPoints);

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