// Score Board Component with Romantic Styling
import './ScoreBoard.css';

const ScoreBoard = ({ supremScore, nammuScore, supremLovePoints = 0, nammuLovePoints = 0, currentPlayer }) => {
    return (
        <div className="scoreboard">
            {/* Suprem Score Card */}
            <div className={`player-card suprem ${currentPlayer === 'Suprem' ? 'active' : ''}`}>
                <div className="player-info">
                    <span className="avatar">👨</span>
                    <span className="name">Suprem</span>
                </div>
                <div className="score-details">
                    <div className="main-score" title="Goals Scored">
                        {supremScore}
                    </div>
                    <div className="love-score" title="Love Points">
                        <span className="heart-icon">💖</span>
                        {supremLovePoints}
                    </div>
                </div>
            </div>

            {/* VS Divider */}
            <div className="versus-section">
                <span className="vs-text">VS</span>
            </div>

            {/* Nammu Score Card */}
            <div className={`player-card nammu ${currentPlayer === 'Nammu' ? 'active' : ''}`}>
                <div className="score-details">
                    <div className="main-score" title="Goals Scored">
                        {nammuScore}
                    </div>
                    <div className="love-score" title="Love Points">
                        {nammuLovePoints}
                        <span className="heart-icon">💖</span>
                    </div>
                </div>
                <div className="player-info">
                    <span className="name">Nammu</span>
                    <span className="avatar">👩</span>
                </div>
            </div>
        </div>
    );
};

export default ScoreBoard;
