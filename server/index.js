const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const router = require('./router');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

const { Room } = require('./room.js');
let rooms = {};

io.on('connection', (socket) => {
    console.log('socket connected ', Object.keys(rooms).length);
    socket.on('join', (...args) => handleJoin(socket, ...args));
    socket.on('disconnect', () => handleDisconnect(socket));
    socket.on('startGame', handleStartGame);
    socket.on('submitAnswer', ({ ...args }) => handleSubmitAnswer({ ...args, userId: socket.id }));
    socket.on('answersShown', handleAnswersShown);
    socket.on('playerPromptVote', handlePlayerVote);
    socket.on('fetchPoints', handleFetchPoints);
});

const handleJoin = (socket, { name, room, isHost }, callback) => {
    if (!rooms[room]) {
        rooms[room] = new Room(room);
    }

    const roomObj = rooms[room];
    const { user, error} = rooms[room].addUser({id: socket.id, name, isHost});

    if (error) {
        return callback(error);
    }

    socket.join(roomObj.id, err => {
        if (err) {
            return callback(error);
        } else {
            console.log(`${user.name || "host"} joined ${roomObj.id}`);
            io.to(roomObj.id).emit('userJoined', roomObj.getNonHostUsers());
        }
    })
};

const handleDisconnect = (socket) => {
    const roomName = Object.keys(rooms).find(room => rooms[room].users.some(user => user.id === socket.id));
    if (roomName) {
        const user = rooms[roomName].removeUser(socket.id);
        if (user) {
            console.log(`${user.name || "host"} left ${roomName}`);
            io.to(roomName).emit('userLeft', { name: user.name });
        }
        console.log(`unnamed user leaving ${roomName}`);
        socket.leave(roomName);
    }
};

// assign prompts to users and send to clients
const handleStartGame = ({ room }) => {
    if (rooms[room]) {
        io.to(room).emit('gameStarted');
        const gamePrompts = rooms[room].setupGamePrompts();
        console.log('prompts: ', gamePrompts);
        io.to(room).emit('prompts', gamePrompts);
    }
};

const handleSubmitAnswer = ({ room, ...rest }) => {
    if (rooms[room]) {
        const updatedPrompts = rooms[room].handleSubmitAnswer({ ...rest });
        if (updatedPrompts) {
            const host = rooms[room].getHost();
            if (host) {
                io.to(host.id).emit('answers', updatedPrompts); 
            }
        }
    }
};

const handleAnswersShown = ({ prompt, room }) => {
    io.to(room).emit('startPlayerVote', prompt);
};

const handlePlayerVote = ({ room, ...rest }) => {
    if (rooms[room]) {
        const updatedPrompt = rooms[room].handlePlayerVote({ ...rest });
        if (updatedPrompt) {
            const host = rooms[room].getHost();
            if (host) {
                io.to(host.id).emit('playerVotes', updatedPrompt);
                setTimeout(() => {
                    io.to(host.id).emit('nextPromptVoting');
                }, 1000);
            }
        }
    }
};

const handleFetchPoints = (room) => {
    if (rooms[room]) {
        const points = rooms[room].points;
        const host = rooms[room].getHost();
        if (host) {
            console.log('points: ', points);
            io.to(host.id).emit('pointStandings', points);
        }
    }
}

// io.on('connection', (socket) => {
//     console.log('socket connected ', Object.keys(rooms).length);
//     socket.on('join', (...args) => handleJoin(socket, ...args));
//     socket.on('disconnect', () => handleDisconnect(socket));
//     socket.on('startGame', handleStartGame);
//     socket.on('submitAnswer', ({ ...args }) => handleSubmitAnswer({ ...args, userId: socket.id }));
//     socket.on('answersShown', handleAnswersShown);
//     socket.on('playerPromptVote', handlePlayerVote);
// });

// app.use(router);
// server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

// const handleJoin = (socket, { name, room, isHost }, callback) => {
//     const { user, error } = addUser({id: socket.id, name, room, isHost});

//     if (error) {
//         return callback(error);
//     }

//     socket.join(user.room, (err) => {
//         if (err) {
//             return callback(error);
//         } else {
//             console.log(`${user.name || "host"} joined ${user.room}`);
//             io.to(user.room).emit('userJoined', getUsersInRoom(user.room));
//         }
//     });
// };

// const handleDisconnect = (socket) => {
//     const user = removeUser(socket.id);
//     if (user) {
//         console.log(`${user.name || "host"} left ${user.room}`);
//         io.to(user.room).emit('userLeft', { name: user.name });
//         socket.leave(user.room);
//     }
// };

// assign prompts to users and send to clients
// const handleStartGame = ({ room }) => {
//     io.to(room).emit('gameStarted');
//     const users = getUsersInRoom(room);
//     gamePrompts = getGamePrompts(users);
//     console.log(gamePrompts);
//     io.to(room).emit('prompts', gamePrompts);
// }

// const handleSubmitAnswer = ({ userId, promptId, answer, name }) => {
//     let answeredPrompt = gamePrompts.find(prompt => prompt.id === promptId);
//     answeredPrompt.answers[name] = answer;

//     // if all prompts have been answered, send answers to host client
//     if (allAnswersSubmitted(gamePrompts)) {
//         const room = getUser(userId).room;
//         const hostId = getHostByRoom(room).id;
//         io.to(hostId).emit('answers', gamePrompts);
//     }
// };

// const handleAnswersShown = ({ prompt, room }) => {
//     io.to(room).emit('startPlayerVote', prompt);
// };

// const handlePlayerVote = ({ prompt, room, voterName, promptAuthor }) => {
//     console.log(`${voterName} voted for ${promptAuthor}'s answer to the question '${prompt.prompt}'`);
// };









// ****** UTILS METHODS ********

// const allAnswersSubmitted = (prompts) => {
//     // every prompt should be answered by 2 users
//     return prompts.every(prompt => Object.keys(prompt.answers).length === 2);
// };

// const getGamePrompts = (users) => {
//     // shuffle users twice and pair neighbors each time
//     // ex. [a,b,c,d] and [d,b,a,c] -> [[a,b], [c,d], [d,b], [a,c]]
//     let userPairs = [];
//     const userNames = users.map(user => user.name);
//     const shuffle1 = shuffle(userNames);
    
//     // if theres an odd # of players, continue to re-shuffle until last value is different from last value of 1st shuffle
//     let shuffle2;
//     let extraPair;
//     if (userNames.length % 2 === 0) {
//         shuffle2 = shuffle(userNames);
//     } else {
//         const extraName1 = shuffle1[shuffle1.length - 1];
//         let distinctLastValues = false;
//         while (!distinctLastValues) {
//             shuffle2 = shuffle(userNames);
//             if (shuffle2[shuffle2.length - 1] !== extraName1) {
//                 distinctLastValues = true;
//             }
//         }
//         extraPair = [extraName1, shuffle2[shuffle2.length - 1]];
//     }

//     for (let i=0; i<userNames.length - 1; i += 2) {
//         userPairs.push(shuffle1.slice(i, i+2));
//         userPairs.push(shuffle2.slice(i, i+2));
//     }

//     if (extraPair) {
//         userPairs.push(extraPair);
//     }

//     let gamePrompts = shuffle(prompts).slice(0, userPairs.length);
//     return gamePrompts.map((prompt, idx) => {
//         return {
//             id: idx,
//             prompt: prompt,
//             answers: {},
//             users: userPairs.pop()
//         };
//     });
// };

// const shuffle = values => {
//     const sliced = values.slice();
//     sliced.sort((a,b) => 0.5 - Math.random());
//     return sliced;
// }