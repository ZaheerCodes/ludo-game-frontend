import styles from './Board.module.css';
import clsx from 'clsx';

function Board({ children }) {

    return (
        <>
            <div className={clsx(styles.board)}>
                {children}
            </div>
        </>
    );
}

export default Board;
