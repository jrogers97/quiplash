import { Server } from "http";

import express, { Application } from 'express';
import socketio from 'socket.io';
import http from 'http';

const router = require('./router');
const PORT = process.env.PORT || 5000;

const app: Application = express();
const server: Server = http.createServer(app);
const io: SocketIO.Server = socketio(server);

app.use(router);
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

// ****************************************

import Room from './room';
import {
    IRoom,
    SocketJoinParams,
    SocketJoinError,
    PromptVoteWithRoom,
    PromptAnswerWithRoom,
    GamePrompt,
    FetchPointsCallback
} from './interfaces';

// maintain current rooms
let rooms: {[key: string]: IRoom} = {};
const NUM_ROUNDS = 3;

io.on('connection', (socket) => {
    console.log('socket connected ', Object.keys(rooms).length);
    socket.on('join', ({name, room, isHost}: SocketJoinParams, callback: () => void) => handleJoin(socket, {name, room, isHost}, callback));
    socket.on('disconnect', () => handleDisconnect(socket));

    socket.on('validateRoomParams', handleValidateJoinParams);
    socket.on('startGame', handleStartGame);
    socket.on('submitAnswer', handleSubmitAnswer);
    socket.on('submitTimerEnded', handleSubmitTimerEnded);
    socket.on('answersShown', handleAnswersShown);
    socket.on('playerPromptVote', handlePlayerVote);
    socket.on('voteTimerEnded', handleVoteTimerEnded);
    socket.on('fetchUsersInRoom', handleFetchUsers);
    socket.on('fetchPoints', handleFetchPoints);
});

const handleJoin = (socket: SocketIO.Socket, { name, room, isHost }: SocketJoinParams, errorCallback: () => void) => {
    if (!room) {
        return errorCallback();
    }

    if (!rooms[room]) {
        rooms[room] = new Room(room);
    }

    const roomObj = rooms[room];
    const user = rooms[room].addUser({id: socket.id, name, isHost: !!isHost});

    socket.join(roomObj.id, err => {
        if (err) {
            return errorCallback();
        } else {
            console.log(`${user ? user.name : "host"} joined ${roomObj.id}`);
            io.to(roomObj.id).emit('userJoined', roomObj.getNonHostUsers());
        }
    })
};

const handleDisconnect = (socket: SocketIO.Socket): void => {
    const roomName = Object.keys(rooms).find(room => rooms[room].users.some(user => user.id === socket.id));
    if (roomName) {
        const roomHost = rooms[roomName].getHost();
        const user = rooms[roomName].removeUser(socket.id);
        if (user) {
            console.log(`${user.name || "host"} left ${roomName}`);
            io.to(roomName).emit('userLeft', { name: user.name });
            if (roomHost?.id === user.id) {
                delete rooms[roomName];
                console.log(Object.keys(rooms));
            }
        }
        socket.leave(roomName);
    }
};

const handleValidateJoinParams = ({ room, name }: SocketJoinParams, callback: (error: SocketJoinError) => void) => {
    let error: SocketJoinError = {nameError: '', roomError: ''};
    console.log('rooms: ', Object.keys(rooms), room);
    if (!rooms[room]) {
        error.roomError = "Room does not exist!";
    } else if (rooms[room].gameStarted) {
        error.roomError = "That room's game has already started!";
    } else if (rooms[room].getNonHostUsers().map(user => user.name).indexOf(name) > -1) {
        error.nameError = "That name is taken!";
    }
    callback(error);
};

// assign prompts to users and send to clients
const handleStartGame = (room: string) => {
    if (rooms[room]) {
        io.to(room).emit('gameStarted');
        rooms[room].setupGame();
        startRound(room);
    }
};

const startRound = (room: string) => {
    const roomObj = rooms[room];
    if (roomObj) {
        console.log('starting round ', roomObj.round);
        const roundPrompts = roomObj.getRoundPrompts();
        if (roundPrompts) {
            io.to(room).emit('interstitial', roomObj.round);
            setTimeout(() => {
                io.to(room).emit('startNewRound', roomObj.round);
                io.to(room).emit('prompts', roundPrompts);
            }, 3000);
        }
    }
};

const endGame = (room: string) => {
    io.to(room).emit('endGame');
};

const handleSubmitAnswer = ({ promptId, answer, name, room }: PromptAnswerWithRoom, callback: () => void) => {
    if (rooms[room]) {
        const { updatedPrompts, finishedUser } = rooms[room].handleSubmitAnswer({ promptId, answer, name });
        if (updatedPrompts || finishedUser) {
            const host = rooms[room].getHost();
            if (host) {
                if (finishedUser) {
                    io.to(host.id).emit('userAnsweredAllPrompts', finishedUser); 
                }
                if (updatedPrompts) {
                    setTimeout(() => {
                        io.to(host.id).emit('answers', updatedPrompts); 
                    }, 1000);
                }
            }
        }
        // confirm server received the answer
        callback();
    }
};

const handleSubmitTimerEnded = (room: string) => {
    const roomObj: Room = rooms[room];
    if (roomObj) {
        const host = roomObj.getHost();
        if (host) {
            const roundPrompts = roomObj.gamePrompts[roomObj.round];
            io.to(host.id).emit('answers', roundPrompts);
        }
    }
};

const handleAnswersShown = ({ prompt, room }: {prompt: GamePrompt, room: string}) => {
    io.to(room).emit('startPlayerVote', prompt);
};

const handlePlayerVote = ({ room, prompt, voterName, promptAuthor }: PromptVoteWithRoom, callback: () => void) => {
    if (rooms[room]) {
        const updatedPrompt = rooms[room].handlePlayerVote({ prompt, voterName, promptAuthor });
        if (updatedPrompt) {
            const host = rooms[room].getHost();
            if (host) {
                io.to(host.id).emit('playerVotes', updatedPrompt.votes);
                setTimeout(() => {
                    io.to(host.id).emit('nextPromptVoting');
                }, 5000);
            }
        }
        // confirm server received the vote
        callback();
    }
};

const handleVoteTimerEnded = ({ room, promptId }: { room: string, promptId: number }) => {
    const roomObj: Room = rooms[room];
    if (roomObj) {
        const host = roomObj.getHost();
        if (host) {
            const gamePrompts = roomObj.gamePrompts[roomObj.round];
            const votedPrompt: GamePrompt | undefined = gamePrompts.find(prompt => prompt.id === promptId);
            if (votedPrompt) {
                io.to(host.id).emit('playerVotes', votedPrompt.votes);
                setTimeout(() => {
                    io.to(host.id).emit('nextPromptVoting');
                }, 5000);
            }
        }
    }
};

const handleFetchUsers = (room: string, callback: (users: string[]) => void) => {
    if (rooms[room]) {
        const usersInRoom = rooms[room].getNonHostUsers();
        callback(usersInRoom.map(user => user.name));
    }
}

const handleFetchPoints = (room: string, callback: (pointsObj: FetchPointsCallback) => void) => {
    if (rooms[room]) {
        const points = rooms[room].points;
        const prevPoints = rooms[room].previousRoundPoints;
        callback({ fetchedPoints: points, fetchedPreviousPoints: prevPoints });
        if (rooms[room].round >= NUM_ROUNDS) {
            endGame(room);
        } else {
            setTimeout(() => {
                // start new round after a few seconds of showing the standings
                console.log('fetched points ', rooms[room].round);
                if (rooms[room].round < NUM_ROUNDS) {
                    rooms[room].round++;
                    startRound(room);
                } else {
                    endGame(room);
                    console.log('ending game');
                }
            }, 5000);
        }
    }
};
