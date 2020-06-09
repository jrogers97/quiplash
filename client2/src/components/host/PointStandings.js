import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../context/userContext';

const PointStandings = () => {
    const { socket, room } = useContext(UserContext);
    const [points, setPoints] = useState({});

    useEffect(() => {
        if (socket) {
            socket.emit('fetchPoints', room, setPoints);
        }

        // cleanup
        return () => socket.off('pointStandings');
    }, [socket, room]);

    return (
        <div>
            {Object.keys(points).map(user => 
                <div key={user}>{user}: {points[user]}</div>
            )}
        </div>
    );
};

export default PointStandings;