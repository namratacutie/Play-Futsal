// Score Board Component with Romantic Styling
import './ScoreBoard.css';

const ScoreBoard = ({ supremScore, nammuScore, currentPlayer }) => {
    return (
        <div className="scoreboard">
            <div className={`player-score suprem ${currentPlayer === 'Suprem' ? 'active' : ''}`}>
                <span className="avatar">👨</span>
                <span className="name">Suprem</span>
                <span className="score">{supremScore}</span>
            </div>

            <div className="score-divider">
                <span className="heart-icon">❤️</span>
                <span className="vs">VS</span>
            </div>

            <div className={`player-score nammu ${currentPlayer === 'Nammu' ? 'active' : ''}`}>
                <span className="score">{nammuScore}</span>
                <span className="name">Nammu</span>
                <span className="avatar">👩</span>
            </div>
        </div>
    );
};

export default ScoreBoard;
