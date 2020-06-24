const { prompts } = require('./prompts.js');
import {
    User,
    GamePrompt,
    GamePrompts
} from './interfaces';

const NUM_ROUNDS = 3;

const makeGamePrompts = (users: User[]): GamePrompts => {
    let gamePrompts: {[key: number]: GamePrompt[]} = {};
    let roundPrompts = shuffle(prompts).slice(0, users.length * NUM_ROUNDS);
    for (let i=0; i < NUM_ROUNDS; i++) {
        // shuffle users twice and pair neighbors each time
        // ex. [a,b,c,d] and [d,b,a,c] -> [[a,b], [c,d], [d,b], [a,c]]
        let userPairs: string[][] = [];
        const userNames = users.map(user => user.name);
        const shuffle1: string[] = shuffle(userNames);
        
        // if theres an odd # of players, continue to re-shuffle until last value is different from last value of 1st shuffle
        let shuffle2: string[] = [];
        let extraPair: string[] = [];
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

        for (let j=0; j<userNames.length - 1; j += 2) {
            userPairs.push(shuffle1.slice(j, j+2));
            userPairs.push(shuffle2.slice(j, j+2));
        }

        if (extraPair.length) {
            userPairs.push(extraPair);
        }

        gamePrompts[i+1] = roundPrompts.splice(0, userPairs.length)
            .map((prompt, idx) => {
                const userPair = userPairs.pop();
                if (userPair) {
                    return {
                        id: idx,
                        prompt: prompt,
                        answers: {},
                        users: userPair,
                        votes: userPair.reduce((acc: {[key: string]: string[]}, curr: string) => {
                                acc[curr] = [];
                                return acc;
                            }, {})
                    };
                }
                return null;
            }).filter(prompt => prompt !== null) as GamePrompt[];
    };
    return gamePrompts;
};

const shuffle = <T>(values: T[]): T[] => {
    const sliced = values.slice();
    sliced.sort((a,b) => 0.5 - Math.random());
    return sliced;
};

const allAnswersSubmitted = (prompts: GamePrompt[]): boolean => {
    // checks if every prompt is answered by 2 users
    return prompts.every(prompt => Object.keys(prompt.answers).length === 2);
};

const allUserAnswersSubmitted = (prompts: GamePrompt[], name: string): boolean => {
    // checks if specific user submitted 2 answers
    const numUserOccurrences = prompts.reduce((acc, curr) => {
        return (Object.keys(curr.answers).indexOf(name) >= 0) ? acc + 1 : acc;
    }, 0);

    return numUserOccurrences >= 2;
};

const allPlayersVotedOnPrompt = (prompt: GamePrompt, users: User[]): boolean => {
    // prompt should be voted on by users.length - 2 players
    const allVoters = Object.values(prompt.votes).reduce((acc, curr) => {
        acc = [ ...acc, ...curr ];
        return acc;
    }, []);
    return allVoters.length === users.length - 2;
};

module.exports = { makeGamePrompts, allAnswersSubmitted, allUserAnswersSubmitted, allPlayersVotedOnPrompt };