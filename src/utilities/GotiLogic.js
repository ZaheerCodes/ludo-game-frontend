export class GotiClass {
    static saveCells = [0, 8, 13, 21, 26, 34, 39, 47];
    static dice = [1, 6, 2, 5, 3, 4, 6];
    key = '';
    cell;
    initialPos;
    path;

    constructor(key, path, initialPos, cell = -1) {
        this.key = key;
        this.path = path;
        this.initialPos = initialPos;
        this.cell = cell;
    }

    canMove(steps) {
        if (this.cell < 0) {
            if (steps === 6) {
                return true;
            } else {
                return false;
            }
        }
        return this.cell + steps < this.path.length;
    }

    static getNewCell(goti, dice) {
        if (goti.cell < 0 && dice === 6) {
            return 0;
        } else {
            return goti.cell + 1;
        }
    }

    static getCollidedGotis(tg, gotis) {
        let sendHome = [];
        const turn = this.getTurn(tg.key);
        const opponents = gotis.filter((g) => !g.key.includes(turn));
        // No collisions if goti is in home or in a save cell
        if (!tg || tg.cell <= 0 || this.saveCells.includes(tg.cell))
            return sendHome;
        for (let j = 0; j < opponents.length; j++) {
            const og = opponents[j];
            // Skipping if opponent is in home or in a save cell
            if (!og || og.cell === -1 || this.saveCells.includes(og.cell))
                continue;
            if (
                tg.path[tg.cell]?.x === og.path[og.cell]?.x &&
                tg.path[tg.cell]?.y === og.path[og.cell]?.y
            ) {
                sendHome.push(og.key);
            }
        }
        return sendHome;
    }

    static getTurn(id) {
        let result = '';
        for (let i = 0; i < id.length; i++) {
            if (id[i] === '-') break;
            result += id[i];
        }
        return result;
    }

    static rollDice(current) {
        if (current > 0) return current;
        return this.dice[Math.floor(Math.random() * 7)];
    }

    static getMovables(steps, turn, gotis) {
        return gotis.filter((g) => {
            if (g.key.includes(turn) && g.canMove(steps)) {
                return true;
            }
        });
    }
}
