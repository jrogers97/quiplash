// const { getHost } = require('./users.js');
// const { prompts } = require('./prompts.js');
// const socketio = require('socket.io');

// const setupGame = ({ io, socket, room, users }) => {
//     let gamePrompts = getGamePrompts(users);
//     console.log(gamePrompts);
//     io.to(room).emit('prompts', gamePrompts);
//     socket.on('submitAnswer', ({ id, answer, name }) => handleSubmitAnswer(gamePrompts, id, answer, name));
//     if (allAnswersSubmitted(gamePrompts)) {
//         const hostId = getHost(room).id;
//         io.sockets.socket(hostId).emit('answers', gamePrompts);
//         console.log('all answers submitted');
//     }
// };

// const handleSubmitAnswer = (prompts, id, answer, name) => {
//     console.log(answer, name);
//     let answeredPrompt = prompts.find(prompt => prompt.id === id);
//     prompts[answeredPrompt].answers[name] = answer;
//     console.log(prompts);
// };

// const allAnswersSubmitted = (prompts) => {
//     return prompts.every(prompt => Object.keys(prompt.answers) === 2);
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
//     return gamePrompts.map(prompt => {
//         return {...prompt, users: userPairs.pop()}
//     });
// };

// const shuffle = values => {
//     const sliced = values.slice();
//     sliced.sort((a,b) => 0.5 - Math.random());
//     return sliced;
// }

// module.exports = { setupGame };