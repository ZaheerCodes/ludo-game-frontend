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

    let [dice, setDice] = useState(0);
    let groups = ['red', 'green', 'yellow', 'blue'];
    let [turn, setTurn] = useState(0);
    const gotisRef = useRef(gotis);
    const finishRef = useRef(null);
    const movingRef = useRef({ id: null, step: 0, total: 0, running: false });
    const timeoutRef = useRef(null);
    const turnRef = useRef(turn);
    let [stopInput, setStopInput] = useState(false);

    useEffect(() => {
        turnRef.current = turn;
    }, [turn]);

    useEffect(() => {
        gotisRef.current = gotis;
    }, [gotis]);

    useEffect(() => {
        if (finishRef.current?.id) {
            const { id, target, localDice } = finishRef.current;
            const cols = handleCollision(id, gotis).length;
            if (cols === 0) setStopInput(false);
            if (
                cols === 0 &&
                localDice !== 6 &&
                target.cell + localDice !== target.path.length
            )
                nextTurn();
            finishRef.current = null;
        }
    }, [gotis]);

    useEffect(() => {
        if (dice > 0) {
            const movables = GotiClass.getMovables(dice, groups[turn], gotis);
            if (movables.length === 1) {
                moveGoti(movables[0].key);
            }
        }
    }, [dice, turn, gotis]);

    useEffect(() => {
        function handleKeyDown(e) {
            if (stopInput) return;
            if (e.code === 'Space') {
                e.preventDefault();
                rollDice(turnRef.current);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [stopInput]);

    function moveGoti(id) {
        const localDice = dice;
        if (localDice === 0 || movingRef.current.running) return;
        const target = gotisRef.current.find((g) => g.key === id);
        if (
            !target ||
            !target.key.includes(groups[turnRef.current]) ||
            !target.canMove(localDice)
        )
            return;
        movingRef.current = {
            id,
            step: 0,
            total: localDice,
            running: true,
        };
        setStopInput(true);
        doStep();
        function doStep() {
            const { id } = movingRef.current;
            setGotis((prev) => {
                return prev.map((g) => {
                    if (g.key === id) {
                        let newGoti = new GotiClass(
                            id,
                            g.path,
                            g.initialPos,
                            GotiClass.getNewCell(g, localDice)
                        );
                        if (newGoti.cell === redPath.length - 1) prevTurn();
                        return newGoti;
                    }
                    return g;
                });
            });

            movingRef.current.step += 1;
            if (target.cell < 0 && localDice === 6) {
                movingRef.current.step = 6;
            }

            if (movingRef.current.step < movingRef.current.total) {
                timeoutRef.current = setTimeout(doStep, 200);
            } else {
                finishRef.current = { id, target, localDice };
                movingRef.current = {
                    id: null,
                    step: 0,
                    total: 0,
                    running: false,
                };
                setDice(0);
            }
        }
    }

    function handleCollision(id, gotis) {
        const g = gotis?.find((g) => g.key === id);
        if (!g) return [];
        let sendHomeIds = GotiClass.getCollidedGotis(g, gotis);
        if (sendHomeIds.length > 0) {
            const promises = sendHomeIds.map((g) => goHome(g));
            Promise.allSettled(promises).then(() => setStopInput(false));
        }
        return sendHomeIds;
    }

    function goHome(id) {
        let cell = 50;
        return new Promise((resolve) => {
            let repeatFunc = setInterval(() => {
                setGotis((prev) => {
                    return prev.map((g) => {
                        if (g.key === id) {
                            cell = g.cell - 1;
                            return new GotiClass(
                                id,
                                g.path,
                                g.initialPos,
                                cell
                            );
                        }
                        return g;
                    });
                });
                if (cell === -1) {
                    clearInterval(repeatFunc);
                    resolve();
                }
            }, 150);
        });
    }

    const rollDice = (curTurn, gotis = gotisRef.current) => {
        if (movingRef.current.running || dice > 0 || stopInput) return;
        setDice((prev) => {
            const steps = GotiClass.rollDice(prev);
            const movables = GotiClass.getMovables(
                steps,
                groups[curTurn],
                gotis
            );
            if (movables.length > 0) {
                return steps;
            } else {
                nextTurn();
                return 0;
            }
        });
    };

    function nextTurn() {
        setTurn((prev) => (prev + 1) % 4);
    }

    function prevTurn() {
        setTurn((prev) => (prev - 1) % 4);
    }

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
                        stopInput={stopInput}
                    />
                ))}
            </Board>
            <p>{groups[turn] + ' : ' + dice}</p>
            <p>{'' + stopInput}</p>
        </>
    );
}

export default App;
