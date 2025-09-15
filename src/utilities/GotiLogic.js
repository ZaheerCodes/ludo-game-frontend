export class GotiClass {
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

    move(moved, dice) {
        if (this.cell < 0) {
            console.log('opened: ', moved, this.cell);
            if (dice === 6) {
                this.cell = 0;
                return dice * 2;
            }
        } else {
            console.log('before: ', moved, this.cell);
            this.cell = this.cell + 1;
            console.log('after: ', moved, this.cell);
            return moved + 1;
        }
    }
}
