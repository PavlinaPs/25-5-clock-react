import "./App.css";
import BreakLength from "../../components/BreakLength/BreakLength";
import SessionLength from "../../components/SessionLength/SessionLength";
import Session from "../../components/Session/Session";
import Footer from "../../components/Footer/Footer";
import sound from "../../assets/mixkit-alarm-clock-beep-988.wav";
import { useReducer, useRef, useEffect } from "react";

const initialState = {
  breakLength: 5,
  sessionLength: 25,
  timeLeft: 1500,
  timerPaused: true,
  sessionOn: true,
};

export const ACTIONS = {
  INC_BREAK: "increment break",
  DEC_BREAK: "decrement break",
  INC_SESSION: "increment session",
  DEC_SESSION: "decrement session",
  PAUSED: "timer paused",
  COUNTDOWN: "countdown",
  SET_TIME_LEFT: "set new time left",
  RESET: "reset",
};

const reducer = (state, { type }) => {
  switch (type) {
    // increments & sets max break length
    case ACTIONS.INC_BREAK:
      if (state.breakLength === 60) {
        return state;
      }
      return {
        ...state,
        breakLength: increment(state.breakLength),
      };

    // decrements & sets min break length
    case ACTIONS.DEC_BREAK:
      if (state.breakLength === 1) {
        return state;
      }
      return {
        ...state,
        breakLength: decrement(state.breakLength),
      };

    // increments & sets max session length
    case ACTIONS.INC_SESSION:
      if (state.sessionLength === 60) {
        return state;
      }
      return {
        ...state,
        sessionLength: increment(state.sessionLength),
      };

    // decrements & sets min session length
    case ACTIONS.DEC_SESSION:
      if (state.sessionLength === 1) {
        return state;
      }
      return {
        ...state,
        sessionLength: decrement(state.sessionLength),
      };

    // toggles timer on / pause
    case ACTIONS.PAUSED:
      if (state.timerPaused === false) {
        return {
          ...state,
          timerPaused: true,
        };
      }
      if (state.timerPaused === true) {
        return {
          ...state,
          timerPaused: false,
        };
      }

    // decrements time left & switches session / break
    case ACTIONS.COUNTDOWN:
      if (state.timeLeft === 0) {
        return {
          ...state,
          timeLeft: state.sessionOn
            ? state.breakLength * 60
            : state.sessionLength * 60,
          sessionOn: !state.sessionOn,
        };
      }
      return {
        ...state,
        timeLeft: decrement(state.timeLeft),
      };

    // sets initial session length
    case ACTIONS.SET_TIME_LEFT:
      return {
        ...state,
        timeLeft: state.sessionLength * 60,
      };

    // resets to initial state
    case ACTIONS.RESET:
      return {
        ...state,
        breakLength: 5,
        sessionLength: 25,
        timeLeft: 1500,
        timerPaused: true,
        sessionOn: true,
      };

    default:
      throw Error();
  }
};

function increment(number) {
  return number + 1;
}

function decrement(number) {
  return number - 1;
}

function App() {
  const playBeep = useRef();
  const [state, dispatch] = useReducer(reducer, initialState);

  // timer on / pause logic
  useEffect(() => {
    let intervalId;
    if (state.timerPaused === true) {
      clearInterval(intervalId);
      return;
    }
    if (state.timerPaused === false) {
      intervalId = setInterval(() => {
        return dispatch({
          type: ACTIONS.COUNTDOWN,
        });
      }, 1000);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [state.timerPaused]);

  // sets initial session length
  useEffect(() => {
    dispatch({
      type: ACTIONS.SET_TIME_LEFT,
    });
  }, [state.sessionLength]);

  // beeps when the time is up
  useEffect(() => {
    if (state.timeLeft === 0 && playBeep.current) {
      playBeep.current.play();
    }
  }, [state.timeLeft]);

  // pauses beep and dispatches reset
  //// the only way it passes the last test
  const handleReset = () => {
    if (playBeep.current) {
      playBeep.current.pause();
      playBeep.current.currentTime = 0;
    }
    dispatch({ type: ACTIONS.RESET });
  };

  return (
    <div className="App">
      <main className="main">
        <h1 className="title">25 + 5 Clock</h1>
        <div className="clock-container">
          <div className="length-container">
            <BreakLength breakLength={state.breakLength} dispatch={dispatch} />
            <SessionLength
              sessionLength={state.sessionLength}
              dispatch={dispatch}
            />
          </div>
          <Session
            sessionLength={state.sessionLength}
            dispatch={dispatch}
            sessionOn={state.sessionOn}
            breakLength={state.breakLength}
            timeLeft={state.timeLeft}
            timerPaused={state.timerPaused}
            handleReset={handleReset}
          />
        </div>
      </main>
      <Footer />
      <audio id="beep" preload="auto" ref={playBeep} src={sound} />
    </div>
  );
}

export default App;
