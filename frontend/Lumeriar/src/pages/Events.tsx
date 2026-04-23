import React from 'react';
import { useNavigate } from 'react-router-dom';

const Events: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="events-page">
            <h1>Events</h1>
            <div className="sections">
                <button onClick={() => navigate('/leaderboard')}>Go to Leaderboard</button>
                <button onClick={() => navigate('/register')}>Go to Register</button>
                <button onClick={() => navigate('/past-winners')}>Go to Past Winners</button>
                <button onClick={() => navigate('/rules-docs')}>Go to Rules and Docs</button>
            </div>
        </div>
    );
};

export default Events;