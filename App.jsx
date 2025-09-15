import Board from './components/Board/Board.jsx';
import Goti from './components/Goti/Goti.jsx';
import { useState, useEffect, useRef } from 'react';
import { redPath, yellowPath, greenPath, bluePath } from './utilities/Path.js';
import { GotiClass } from './utilities/GotiLogic.js';

function App() {
    const [gotis, setGotis] = useState([
        new GotiClass('red-1', redPath, { x: 3, y: 10 }),
        new GotiClass('red-2', redPath, { x: 4, y: 10 }),
        new GotiClass('red-3', redPath, { x: 3, y: 11 }),
        new GotiClass('red-4', redPath, { x: 4, y: 11 }),
        new GotiClass('blue-1', bluePath, { x: 10, y: 10 }),
        new GotiClass('blue-2', bluePath, { x: 11, y: 10 }),
        new GotiClass('blue-3', bluePath, { x: 10, y: 11 }),
        new GotiClass('blue-4', bluePath, { x: 11, y: 11 }),
        new GotiClass('green-1', greenPath, { x: 3, y: 3 }),
        new GotiClass('green-2', greenPath, { x: 4, y: 3 }),
        new GotiClass('green-3', greenPath, { x: 3, y: 4 }),
        new GotiClass('green-4', greenPath, { x: 4, y: 4 }),
        new GotiClass('yellow-1', yellowPath, { x: 10, y: 3 }),
        new GotiClass('yellow-2', yellowPath, { x: 11, y: 3 }),
        new GotiClass('yellow-3', yellowPath, { x: 10, y: 4 }),
        new GotiClass('yellow-4', yellowPath, { x: 11, y: 4 }),
    ]);

    const gotisRef = useRef(gotis);
    useEffect(() => {
        gotisRef.current = gotis;
    }, [gotis]);

    let [dice, setDice] = useState(0);
    let [stepMoved, setStepMoved] = useState(0);
    let [gotiMoved, setGotiMoved] = useState(null);
    let timeoutRef = useRef(null);

    function moveGoti(id) {
        if (dice == 0) return;
        let latestGotis;
        function moveStep() {
            setGotis((prev) => {
                let arr = prev.map((g) => {
                    if (
                        g.key === id &&
                        g.key.includes(groups[turn]) &&
                        g.canMove(dice)
                    ) {
                        setStepMoved(g.move(stepMoved, dice));
                        setGotiMoved(g);
                        let newGoti = new GotiClass(
                            id,
                            g.path,
                            g.initialPos,
                            g.cell
                        );
                        console.log(stepMoved, dice, newGoti.cell);
                        return newGoti;
                    }
                    return g;
                });
                latestGotis = arr;
                console.log(latestGotis);
                return arr;
            });
            if (stepMoved < dice) {
                timeoutRef.current = setTimeout(moveStep, 200);
            }
        }
        timeoutRef.current = setTimeout(moveStep, 200);
    }

    useEffect(() => {
        if (stepMoved >= dice) {
            checkCollision(gotiMoved, gotis);
            if (dice !== 6) nextTurn();
            setDice(0);
            clearTimeout(timeoutRef.current);
        }
    }, [stepMoved, gotiMoved, dice, gotis]);

    function checkCollision(gotiMoved, gotis) {
        const tg = gotiMoved;
        turn = getTurnFromId(tg.key);
        let opponents = gotis.filter((g) => !g.key.includes(groups[turn]));
        console.log('function runs: ', tg, opponents);
        let killGotisId = [];
        let saveCellsIdx = [0, 8, 13, 21, 26, 34, 39, 47];
        const tgOpened = tg.cell <= 0;
        const tgAtSave = saveCellsIdx.includes(tg.cell);
        if (tgOpened || tgAtSave) return;
        // console.log('turnGoti is out and not at save.');
        for (let j = 0; j < opponents.length; j++) {
            const og = opponents[j];
            const ogNotOpen = og.cell === -1;
            const ogAtSave = saveCellsIdx.includes(og.cell);
            if (ogNotOpen || ogAtSave) continue;
            // console.log(og, 'opponentGoti is out and not at save.');
            const matchX = tg?.path?.[tg.cell]?.x === og?.path?.[og.cell]?.x;
            const matchY = tg?.path?.[tg.cell]?.y === og?.path?.[og.cell]?.y;
            if (matchX && matchY) {
                // console.log(og, 'coordinates matched');
                killGotisId.push(og.key);
                killGoti(og.key);
            }
        }
        // console.log('function end: ', tg, opponents, killGotisId);

        function getTurnFromId(id) {
            let result = '';
            for (let i = 0; i < id.length; i++) {
                if (id[i] === '-') continue;
                result += id[i];
            }
            return result;
        }
    }

    function killGoti(id) {
        let cell = 50;
        function moveStep() {
            setGotis((prev) => {
                let arr = prev.map((g) => {
                    if (g.key === id) {
                        g.cell--;
                        cell = g.cell;
                        return new GotiClass(id, g.path, g.initialPos, g.cell);
                    }
                    return g;
                });
                return arr;
            });
            if (cell === -1) {
                clearInterval(repeatFunc);
            }
        }
        const repeatFunc = setInterval(moveStep, 150);
    }

    const rollDice = (curTurn, gotis = gotisRef.current) => {
        let num = Math.ceil(Math.random() * 6);
        // let num = 6;
        setDice((prev) => {
            if (prev > 0) return prev;
            let flag = gotis
                .filter((g) => g.key.includes(groups[curTurn]))
                .some((g) => g.canMove(num));
            if (flag) return num;
            else {
                nextTurn();
                return 0;
            }
        });
    };

    let groups = ['red', 'green', 'yellow', 'blue'];
    let [turn, setTurn] = useState(0);

    const turnRef = useRef(turn);
    useEffect(() => {
        turnRef.current = turn;
    }, [turn]);

    function nextTurn() {
        setTurn((prev) => (prev + 1) % 4);
    }

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.code === 'Space') {
                e.preventDefault();
                rollDice(turnRef.current);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <Board>
                {gotis.map((g) => (
                    <Goti
                        key={g.key}
                        id={g.key}
                        cell={g.cell}
                        initialPos={g.initialPos}
                        path={g.path}
                        turn={{ color: groups[turn], steps: dice }}
                        onMove={moveGoti}
                    />
                ))}
            </Board>
            <p>{groups[turn] + ' : ' + dice}</p>
        </>
    );
}

export default App;
