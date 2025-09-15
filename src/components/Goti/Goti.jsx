import styles from './Goti.module.css';
import clsx from 'clsx';
import PropTypes from 'prop-types';

function Goti({ id, cell, initialPos, path, turn, onMove }) {
    let pX = cell >= 0 ? path[cell].x : initialPos.x;
    let pY = cell >= 0 ? path[cell].y : initialPos.y;
    let isClicked = false;

    let styleWrap = {
        zIndex: id.includes(turn.color) ? '1' : '0',
        // backgroundColor: getColor(),
        transform: `translate(
            calc(100vh / 32 + (100vh / 16) * ${pX}),
            calc(100vh / 32 + (100vh / 16) * ${pY}))`,
        transition: 'transform 0.4s ease',
    };

    let styleImg = {
        // backgroundImage: `url(${getImgUrl()})`,
    };

    function getImgUrl() {
        if (id.includes('red')) return './Goti_red.png';
        if (id.includes('blue')) return './Goti_blue.png';
        if (id.includes('green')) return './Goti_green.png';
        if (id.includes('yellow')) return './Goti_yellow.png';
    }

    function handleClick() {
        if (isClicked) return;
        isClicked = true;
        onMove(id, turn.steps);
        setTimeout(() => {
            isClicked = false;
        }, 1000);
    }

    return (
        <div
            className={styles['goti-wrapper']}
            style={styleWrap}
            onClick={handleClick}
        >
            <img
                src={getImgUrl()}
                className={styles['goti-img']}
                style={styleImg}
            />
        </div>
    );
}

Goti.PropTypes = {
    key: PropTypes.string.isRequired,
    cell: PropTypes.string.isRequired,
    initialPos: PropTypes.exact({
        x: PropTypes.number,
        y: PropTypes.number,
    }).isRequired,
    path: PropTypes.arrayOf(
        PropTypes.exact({
            x: PropTypes.number,
            y: PropTypes.number,
        })
    ).isRequired,
    turn: PropTypes.exact({
        color: PropTypes.string,
        steps: PropTypes.number,
    }),
};

export default Goti;
