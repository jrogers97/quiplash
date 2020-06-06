const { makeGamePrompts, allAnswersSubmitted, allPlayersVotedOnPrompt } = require('./gameUtils');

// handles non-socket related logic for a specific game
function Room(id) {
    this.id = id;
    this.users = [];
    this.gamePrompts = [];
    this.points = {};

    this.pointsValue = 100;
    this.bonusValue = 50;

    this.addUser = ({ id, name, isHost }) => {
        console.log('adding user ', name, isHost);
        const existingUser = this.users.find(user => user.name === name);
        if (existingUser) {
            return {
                error: 'Name is already taken!'
            };
        }
        const user = { id, name, isHost };
        this.users.push(user);
        if (!isHost) {
            this.points[name] = 0;
        }
        return { user };
    };

    this.removeUser = (id) => {
        const idx = this.users.findIndex(user => id === user.id);
        if (idx >= 0) {
            return this.users.splice(idx, 1)[0];
        }
    };

    this.getHost = () => this.users.find(user => user.isHost);

    this.getNonHostUsers = () => this.users.filter(user => !user.isHost);

    this.setupGamePrompts = () => {
        this.gamePrompts = makeGamePrompts(this.getNonHostUsers());
        return this.gamePrompts;
    };

    this.handleSubmitAnswer = ({ userId, promptId, answer, name }) => {
        let answeredPrompt = this.gamePrompts.find(prompt => prompt.id === promptId);
        answeredPrompt.answers[name] = answer;

        // if all prompts have been answered, send answers to host client
        if (allAnswersSubmitted(this.gamePrompts)) {
            return this.gamePrompts;
        }
        return null;
    };

    this.handlePlayerVote = ({ prompt, voterName, promptAuthor }) => {
        // find prompt, add voter name to author's list of votes if it isn't already present
        const votedPrompt = this.gamePrompts.find(gamePrompt => gamePrompt.id === prompt.id);
        if (votedPrompt 
            && votedPrompt.votes.hasOwnProperty(promptAuthor)
            && votedPrompt.votes[promptAuthor].indexOf(voterName) < 0) {
            votedPrompt.votes[promptAuthor].push(voterName);
        }
        console.log(this.gamePrompts);
        if (allPlayersVotedOnPrompt(votedPrompt, this.getNonHostUsers())) {
            this.updatePoints(votedPrompt);
            return votedPrompt;
        }
        return null;
    };

    this.updatePoints = (prompt) => {
        Object.keys(prompt.votes).forEach(user => {
            const numVotes = prompt.votes[user].length;
            // bonus if everyone voted for this answer
            const getsBonus = numVotes === this.getNonHostUsers().length - 2;
            this.points[user] += (this.pointsValue * numVotes) + (getsBonus ? this.bonusValue : 0);
        });
    };
};

module.exports = { Room };