import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import boxes from "./boxes";
import Box from "./Box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faVolumeMute } from "@fortawesome/free-solid-svg-icons";

import clickSound from "./sounds/boop.wav";

function App() {
  const [squares, setSquares] = useState(boxes);
  const [score, setScore] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [highestScore, setHighestScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shortestTime, setShortestTime] = useState(Number.MAX_SAFE_INTEGER);

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const clickSoundAudio = useRef(null);

  const [isWrong, setIsWrong] = useState(false);

  const [isChecked, setIsChecked] = useState(true);

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  useEffect(() => {
    clickSoundAudio.current = new Audio(clickSound);
  }, []);

  function getUntoggledIndexes(squares) {
    return squares.filter((obj) => !obj.on);
  }


  function toggle(id) {
    setSquares((prevSquares) => {
      const newSquares = [];
      for (let i = 0; i < prevSquares.length; i++) {
        const currentSquare = prevSquares[i];
        if (currentSquare.id === id) {
          const updatedSquare = {
            ...currentSquare,
            on: !currentSquare.on,
          };
          newSquares.push(updatedSquare);
        } else {
          newSquares.push(currentSquare);
        }
      }
      return newSquares;
    });
  }

  const squareElements = squares.map((square) => (
    <Box
      key={square.id}
      id={square.id}
      on={square.on}
      toggle={() => handleButtonClick(square.id, square.on)}
    />
  ));

  function startEvents() {
    clearSquares();
    setTimeElapsed(0); // Reset timer
    startGame();
    setGameOver(false); // Reset game over state
  }

  function startGame() {
    setIsGameStarted(true);
  }

  useEffect(() => {
    let timer;
    if (isGameStarted) {
      timer = setInterval(() => {
        setSquares((prevSquares) => {
          const unToggled = prevSquares.filter((obj) => !obj.on);
          const randomIndex =
            unToggled[Math.floor(Math.random() * unToggled.length)].id;
          const updatedSquares = prevSquares.map((square, index) => ({
            ...square,
            on: index === randomIndex ? true : square.on,
          }));
          // Check if all squares are on
          if (updatedSquares.every((square) => square.on)) {
            setGameOver(true);
            clearInterval(timer);
          }
          return updatedSquares;
        });
      }, 1000 / speedMultiplier);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isGameStarted, speedMultiplier]);

  function clearSquares() {
    const clearedSquares = squares.map((square) => ({
      ...square,
      on: false,
    }));
    setSquares(clearedSquares);
    setScore(0); // Reset score counter
    setSpeedMultiplier(1); // Reset speed multiplier
  }

  function handleButtonClick(id, isOn) {
    if (isSoundEnabled) {
      let audioClone = clickSoundAudio.current.cloneNode(); // Allow multiple sounds to play at once
      audioClone.play();
    }

    toggle(id);
    if (!gameOver){
      if (isOn){
        const newScore = score + 1;
        setScore(newScore);
        setIsWrong(false)
        if (newScore > highestScore) {
          setHighestScore(newScore);
        }
        if (newScore > 50 && newScore % 6 === 0) {
          setSpeedMultiplier((prevMultiplier) => prevMultiplier * 1.04);
        }
        if (newScore <= 50 && newScore > 20 && newScore % 3 === 0) {
          setSpeedMultiplier((prevMultiplier) => prevMultiplier * 1.08);
        }
        if (newScore <= 20 && newScore % 3 === 0) {
          setSpeedMultiplier((prevMultiplier) => prevMultiplier * 1.15);
        }
      } else {
        // Ensure score never falls below 0
        if (score > 0) {
          setIsWrong(true)
          setTimeout(() => {
            setIsWrong(false);
          }, 300);
        }
        if (score > 4) {
          setScore((prevScore) => prevScore - 5);
        } else {
          setScore(0);
        }
      }
    }
  }

  useEffect(() => {
    let interval;

    if (isGameStarted) {
      const startTime = Date.now() - timeElapsed;
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
      }, 1);
    }

    if (score >= 50 || gameOver) {
      clearInterval(interval);
      if (timeElapsed < shortestTime && score >= 50) {
        setShortestTime(timeElapsed);
      }
    }

    return () => {
      clearInterval(interval);
    };
  }, [isGameStarted, score, gameOver, timeElapsed, shortestTime]);

  const formatTime = (time) => {
    const milliseconds = Math.floor(time % 1000);
    const seconds = Math.floor(time / 1000);

    return `${seconds}.${
      milliseconds < 10
        ? "00" + milliseconds
        : milliseconds < 100
        ? "0" + milliseconds
        : milliseconds
    }`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <a className="infoDiv">
          A tap-based reaction game, inspired by ones used by professional
          athletes to test reflexes. To Play: Tap blue buttons before the grid fills up. Avoid wrong squares for
            minus points. The game will speed up so be quick.
        </a>
      </header>
      <div className="toggle-slider">
        <span>Reaction Mode</span>
        <label htmlFor="toggle" className="switch">
          <input
            type="checkbox"
            id="toggle"
            checked={isChecked}
            onChange={handleToggle}
          />
          <span class="slider round"></span>
        </label>
        <span>Precision Mode</span>
      </div>
      <div className="bodyDiv">
        <div className="gamePanel">
          <div className={isChecked? "scorePanel" : ""}>
            <span>Current Score: {score} <a className={isWrong ? "deductions":"hidden"}>  -5</a></span>
            <span>Highest Score: {highestScore}</span>
          </div>
          {gameOver && <div className="gameOver">GAME OVER</div>}
          {/* 
          <div className="icon-volume">
            <div onClick={() => setIsSoundEnabled((prevState) => !prevState)}>
              {isSoundEnabled ? (
                <FontAwesomeIcon icon={faVolumeUp} />
              ) : (
                <FontAwesomeIcon icon={faVolumeMute} />
              )}
            </div>
          </div>
          */}  
          <button onClick={startEvents} className="startButton">
            Start
          </button>
        </div>

        <div>{squareElements}</div>

        <div className={isChecked? "" : "stopWatch"}>
          <span>Elapsed time to 50-pts: {formatTime(timeElapsed)}</span>
          <span>
            <div>
              Shortest time:{" "}
              {shortestTime === Number.MAX_SAFE_INTEGER
                ? "N/A"
                : formatTime(shortestTime)}
            </div>
          </span>
        </div>
      </div>
      {gameOver && <div className="gameOverMobile">GAME OVER</div>}
      <div className="footer"></div>
    </div>
  );
}

export default App;
