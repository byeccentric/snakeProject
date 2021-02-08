import React, { useState, useCallback, ChangeEvent } from 'react';

import { DEFAULT_WIDTH, DEFAULT_HEIGHT, SPEED_CONFIG } from 'constants/gameConst';
import Snake from 'components/Game';

import './App.css';

const App = () => {
  const [gameStarted, setStarted] = useState(false);
  const [speed, setSpeed] = useState('normal');
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  /* End game state */
  const [score, setScore] = useState(-1);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSpeed(e.target.value);
  const handleStartGame = () => {
    setStarted(true);
    setScore(-1);
  };
  const handleEndGame = useCallback(
    (newScore: number) => {
      setStarted(false);
      setScore(newScore);
    },
    [setScore, setStarted],
  );
  const handleWidthChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setWidth(e.target.value), [setWidth]);
  const handleHeightChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setHeight(e.target.value), [setHeight]);

  if (gameStarted) {
    return (
      <div className="root">
        <Snake width={width} height={height} speed={speed} handleGameOver={handleEndGame} />
      </div>
    );
  }

  if (score < 0) {
    return (
      <div className="root">
        <div>
          <h1>Snake game</h1>
          <h3>Game options</h3>
          <div className="field">
            <label htmlFor="width">
              Field width (cells number)
              <input id="width" type="text" value={width} maxLength={2} onChange={handleWidthChange} />
            </label>
          </div>
          <div className="field">
            <label htmlFor="height">
              Field height (cells number)
              <input id="height" type="text" value={height} maxLength={2} onChange={handleHeightChange} />
            </label>
          </div>
          <div className="field">
            <label htmlFor="speed">
              Snake speed (difficulty)
              <select defaultValue={speed} id="speed" onChange={handleSpeedChange}>
                {Object.keys(SPEED_CONFIG).map((item) => (
                  <option key={item} value={item} selected={item === speed}>
                    {item.slice(0, 1).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <br />
          <button type="button" onClick={handleStartGame}>
            Let&apos;s start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="root">
      <h1>Game over!</h1>
      <h2>You scored: {score}</h2>
      <h3>Good Job!</h3>
      <button type="button" onClick={handleStartGame}>
        Let&apos;s do it again
      </button>
    </div>
  );
};

export default App;
