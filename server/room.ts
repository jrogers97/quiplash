const { makeGamePrompts, allAnswersSubmitted, allUserAnswersSubmitted, allPlayersVotedOnPrompt } = require('./gameUtils');
import { 
    IRoom,
    User,
    SocketJoinResult,
    SocketSubmitAnswerResult,
    Points,
    GamePrompt,
    PromptAnswer,
    PromptVote
} from './interfaces';

class Room implements IRoom {
    id: string;
    users: User[];
    gamePrompts: GamePrompt[];
    points: Points;
    pointsValue: number;
    bonusValue: number;

    constructor(id: string) {
        this.id = id;
        this.users = [];
        this.gamePrompts = [];
        this.points = {};
        this.pointsValue = 100;
        this.bonusValue = 50;
    }
    
    addUser({ id, name, isHost }: User): SocketJoinResult {
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

    removeUser(id: string) {
        const idx = this.users.findIndex(user => id === user.id);
        if (idx >= 0) {
            return this.users.splice(idx, 1)[0];
        }
    };

    getHost(): User | undefined {
        return this.users.find(user => user.isHost)
    };

    getNonHostUsers(): User[] {
        return this.users.filter(user => !user.isHost)
    };

    setupGamePrompts(): GamePrompt[] {
        this.gamePrompts = makeGamePrompts(this.getNonHostUsers());
        return this.gamePrompts;
    };

    // handleSubmitAnswer({ promptId, answer, name }: PromptAnswer): GamePrompt[] | null {
    handleSubmitAnswer({ promptId, answer, name }: PromptAnswer): SocketSubmitAnswerResult {
        let answeredPrompt: GamePrompt | undefined = this.gamePrompts.find(prompt => prompt.id === promptId);
        if (answeredPrompt) {
            answeredPrompt.answers[name] = answer;
        }

        let out: SocketSubmitAnswerResult = {};

        // if all prompts have been answered, send answers to host client
        if (allAnswersSubmitted(this.gamePrompts)) {
            out['updatedPrompts'] = this.gamePrompts;
        }

        if (allUserAnswersSubmitted(this.gamePrompts, name)) {
            out['finishedUser'] = name;
        }

        return out;
    };

    handlePlayerVote({ prompt, voterName, promptAuthor }: PromptVote): GamePrompt | null  {
        // find prompt, add voter name to author's list of votes if it isn't already present
        const votedPrompt: GamePrompt | undefined = this.gamePrompts.find(gamePrompt => gamePrompt.id === prompt.id);
        if (votedPrompt 
            && votedPrompt.votes.hasOwnProperty(promptAuthor)
            && votedPrompt.votes[promptAuthor].indexOf(voterName) < 0) {
            votedPrompt.votes[promptAuthor].push(voterName);
            console.log(this.gamePrompts);
            if (allPlayersVotedOnPrompt(votedPrompt, this.getNonHostUsers())) {
                this.updatePoints(votedPrompt);
                return votedPrompt;
            }
        }
        return null;
    };

    updatePoints(prompt: GamePrompt): void {
        Object.keys(prompt.votes).forEach(user => {
            const numVotes = prompt.votes[user].length;
            // bonus if everyone voted for this answer
            const getsBonus = numVotes === this.getNonHostUsers().length - 2;
            this.points[user] += (this.pointsValue * numVotes) + (getsBonus ? this.bonusValue : 0);
        });
    };
}

export default Room;