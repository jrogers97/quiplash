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
    PromptVoteWithRoom,
    PromptAnswerWithRoom,
    GamePrompt,
    User,
    Points
} from './interfaces';

// maintain current games
let rooms: {[key: string]: IRoom} = {};

io.on('connection', (socket) => {
    console.log('socket connected ', Object.keys(rooms).length);
    socket.on('join', 
        ({name, room, isHost}: SocketJoinParams, 
         callback: (error: string | undefined) => void) => handleJoin(socket, {name, room, isHost}, callback));
    socket.on('disconnect', () => handleDisconnect(socket));
    socket.on('startGame', handleStartGame);
    socket.on('submitAnswer', handleSubmitAnswer);
    socket.on('answersShown', handleAnswersShown);
    socket.on('playerPromptVote', handlePlayerVote);
    socket.on('fetchUsersInRoom', handleFetchUsers);
    socket.on('fetchPoints', handleFetchPoints);
});

const handleJoin = (socket: SocketIO.Socket, { name, room, isHost }: SocketJoinParams, callback: (error: string | undefined) => void) => {
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
            console.log(`${user ? user.name : "host"} joined ${roomObj.id}`);
            io.to(roomObj.id).emit('userJoined', roomObj.getNonHostUsers());
        }
    })
};

const handleDisconnect = (socket: SocketIO.Socket): void => {
    const roomName = Object.keys(rooms).find(room => rooms[room].users.some(user => user.id === socket.id));
    if (roomName) {
        const user = rooms[roomName].removeUser(socket.id);
        if (user) {
            console.log(`${user.name || "host"} left ${roomName}`);
            io.to(roomName).emit('userLeft', { name: user.name });
        }
        socket.leave(roomName);
    }
};

// assign prompts to users and send to clients
const handleStartGame = ({ room }: {room: string}) => {
    if (rooms[room]) {
        io.to(room).emit('gameStarted');
        const gamePrompts = rooms[room].setupGamePrompts();
        console.log('prompts: ', gamePrompts);
        io.to(room).emit('prompts', gamePrompts);
    }
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

const handleFetchUsers = (room: string, callback: (users: string[]) => void) => {
    if (rooms[room]) {
        const usersInRoom = rooms[room].getNonHostUsers();
        callback(usersInRoom.map(user => user.name));
    }
}

const handleFetchPoints = (room: string, callback: (points: Points) => void) => {
    if (rooms[room]) {
        const points = rooms[room].points;
        callback(points);
    }
};
