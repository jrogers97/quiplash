const { prompts } = require('./prompts.js');

const makeGamePrompts = (users) => {
    // shuffle users twice and pair neighbors each time
    // ex. [a,b,c,d] and [d,b,a,c] -> [[a,b], [c,d], [d,b], [a,c]]
    let userPairs = [];
    const userNames = users.map(user => user.name);
    const shuffle1 = shuffle(userNames);
    
    // if theres an odd # of players, continue to re-shuffle until last value is different from last value of 1st shuffle
    let shuffle2;
    let extraPair;
    if (userNames.length % 2 === 0) {
        shuffle2 = shuffle(userNames);
    } else {
        const extraName1 = shuffle1[shuffle1.length - 1];
        let distinctLastValues = false;
        while (!distinctLastValues) {
            shuffle2 = shuffle(userNames);
            if (shuffle2[shuffle2.length - 1] !== extraName1) {
                distinctLastValues = true;
            }
        }
        extraPair = [extraName1, shuffle2[shuffle2.length - 1]];
    }

    for (let i=0; i<userNames.length - 1; i += 2) {
        userPairs.push(shuffle1.slice(i, i+2));
        userPairs.push(shuffle2.slice(i, i+2));
    }

    if (extraPair) {
        userPairs.push(extraPair);
    }

    let gamePrompts = shuffle(prompts).slice(0, userPairs.length);
    return gamePrompts.map((prompt, idx) => {
        const userPair = userPairs.pop();
        return {
            id: idx,
            prompt: prompt,
            answers: {},
            users: userPair,
            votes: userPair.reduce((acc, curr) => {
                    acc[curr] = [];
                    return acc;
                }, {})
        };
    });
};

const shuffle = values => {
    const sliced = values.slice();
    sliced.sort((a,b) => 0.5 - Math.random());
    return sliced;
};

const allAnswersSubmitted = (prompts) => {
    // every prompt should be answered by 2 users
    return prompts.every(prompt => Object.keys(prompt.answers).length === 2);
};

const allPlayersVotedOnPrompt = (prompt, users) => {
    // prompt should be voted on by users.length - 2 players
    const allVoters = Object.values(prompt.votes).reduce((acc, curr) => {
        acc = [ ...acc, ...curr];
        return acc;
    }, []);
    return allVoters.length === users.length - 2;
};

module.exports = { makeGamePrompts, allAnswersSubmitted, allPlayersVotedOnPrompt };