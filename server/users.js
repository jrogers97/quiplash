const users = [];

const addUser = ({ id, name, room, isHost }) => {
    const existingUser = users.find(user => user.room === room && user.name === name);
    if (existingUser) {
        return {
            error: 'Name is already taken!'
        };
    }

    const user = { id, name, room, isHost };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const idx = users.findIndex(user => id === user.id);
    if (idx >= 0) {
        return users.splice(idx, 1)[0];
    }
}

const getUser = (id) => users.find(user => id === user.id);

const getUsersInRoom = (room) => users.filter(user => !user.isHost && user.room === room);

const getHostByRoom = (room) => users.find(user => user.room === room && user.isHost);

module.exports = { addUser, removeUser, getUser, getUsersInRoom, getHostByRoom };