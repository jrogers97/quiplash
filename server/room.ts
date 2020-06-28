const { makeGamePrompts, allAnswersSubmitted, allUserAnswersSubmitted, allPlayersVotedOnPrompt } = require('./gameUtils');
import { 
    IRoom,
    User,
    SocketSubmitAnswerResult,
    Points,
    GamePrompt,
    PromptAnswer,
    PromptVote
} from './interfaces';

class Room implements IRoom {
    id: string;
    users: User[];
    gamePrompts: {[round: number]: GamePrompt[]};
    gameStarted: boolean;
    round: number;
    points: Points;
    previousRoundPoints: Points;
    pointsValue: number;
    bonusValue: number;
    roundMultiplier: number;

    constructor(id: string) {
        this.id = id;
        this.users = [];
        this.gamePrompts = {};
        this.gameStarted = false;
        this.round = 1;
        this.points = {};
        this.previousRoundPoints = {};
        this.pointsValue = 100;
        this.bonusValue = 50;
        this.roundMultiplier = 1.25;
    }
    
    addUser({ id, name, isHost }: User): User | undefined {
        const user = { id, name, isHost, index: this.getNonHostUsers().length + 1 };
        this.users.push(user);
        if (!isHost) {
            this.points[name] = 0;
        }
        return user;
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

    setupGame(): void {
        this.gamePrompts = makeGamePrompts(this.getNonHostUsers());
        this.gameStarted = true;
    };

    getRoundPrompts(): GamePrompt[] | undefined {
        if (this.gamePrompts) {
            return this.gamePrompts[this.round];
        }
    };

    handleSubmitAnswer({ promptId, answer, name }: PromptAnswer): SocketSubmitAnswerResult {
        let answeredPrompt: GamePrompt | undefined = this.gamePrompts[this.round].find(prompt => prompt.id === promptId);
        if (answeredPrompt) {
            answeredPrompt.answers[name] = answer;
        }

        let ret: SocketSubmitAnswerResult = {};

        // if all prompts have been answered, send answers to host client
        if (allAnswersSubmitted(this.gamePrompts[this.round])) {
            ret['updatedPrompts'] = this.gamePrompts[this.round];
        }

        if (allUserAnswersSubmitted(this.gamePrompts[this.round], name)) {
            ret['finishedUser'] = name;
        }

        return ret;
    };

    handlePlayerVote({ prompt, voterName, promptAuthor }: PromptVote): GamePrompt | null  {
        // find prompt, add voter name to author's list of votes if it isn't already present
        const roundPrompts: GamePrompt[] | undefined = this.gamePrompts[this.round];
        if (roundPrompts) {
            const votedPrompt: GamePrompt | undefined = roundPrompts.find(roundPrompt => roundPrompt.id === prompt.id);
            if (votedPrompt 
                && votedPrompt.votes.hasOwnProperty(promptAuthor)
                && votedPrompt.votes[promptAuthor].indexOf(voterName) < 0) {
                votedPrompt.votes[promptAuthor].push(voterName);
                if (allPlayersVotedOnPrompt(votedPrompt, this.getNonHostUsers())) {
                    this.updatePoints(votedPrompt);
                    return votedPrompt;
                }
            }
        }
        return null;
    };

    updatePoints(prompt: GamePrompt): void {
        Object.keys(prompt.votes).forEach(user => {
            const numVotes = prompt.votes[user].length;
            // bonus if everyone voted for this answer
            const getsBonus = numVotes === this.getNonHostUsers().length - 2;
            const basePoints = Math.round(numVotes * this.pointsValue * (Math.pow(this.roundMultiplier, this.round - 1)));
            this.points[user] += basePoints + (getsBonus ? this.bonusValue : 0);
        });
    };
}

export default Room;