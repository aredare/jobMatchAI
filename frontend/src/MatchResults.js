import React from 'react';

const MatchResults = ({ results }) => {
    const circleStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'blue',
        borderRadius: '50%',
        width: '150px',
        height: '150px',
        color: 'white',
        fontSize: '2em',
        margin: 'auto',
        marginTop: '20px',
    };

    if (!results) {
        return <div></div>;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div style={circleStyle}>{results.matchScore}%</div>
        </div>
    );
};

export default MatchResults;
