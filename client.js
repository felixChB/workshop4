import { Canvas } from "./canvas.js";

// websocket parameters
const webSocketPort = 3000;
//const webSocketAddr = '192.168.0.169';
const webSocketAddr = '10.136.3.243';
//const webSocketAddr = window.location.host;

// create full screen canvas to draw to
// const canvasElem = document.getElementById("canvas");
// const canvas = new Canvas(canvasElem);

const countElem = document.getElementById("bombCount");
const highscoreElem = document.getElementById("highscoreCount");
const playerCountElem = document.getElementById("playerCount");
const waitingElem = document.getElementById("waiting-message");

const gameoverElem = document.getElementById("gameover-screen");
const gameoverScoreElem = document.getElementById("gameover-score");
const gameoverReasonElem = document.getElementById("gameover-reason");
const gameRestartElem = document.getElementById("reset-button");
const diffuseCountElem = document.getElementById("diffuse-counter");

// Anzahl diffuses für jeden Spieler
const maxDiffuses = 4;
let diffuseCount = maxDiffuses;
var clientIntervalID = 0;
let isIntervalRunning = false;

/****************************************************************
 * websocket communication
 */
// const socket = new WebSocket(`wss://${webSocketAddr}:${webSocketPort}`);
const socket = new WebSocket(`ws://${webSocketAddr}:${webSocketPort}`);

// listen to opening websocket connections
socket.addEventListener('open', (event) => {
  // send regular ping messages
  setInterval(() => {
    if (socket.readyState == socket.OPEN) {
      socket.send('');
    }
  }, 20000);
});

diffuseCountElem.innerHTML = "Diffuses left: " + diffuseCount;

// listen to messages from server
socket.addEventListener('message', (event) => {
  const message = event.data;

  if (message.length > 0) {
    const incoming = JSON.parse(message);

    // dispatch incomming messages
    switch (incoming.selector) {
      case 'info':
        if (incoming.counter.toString().length == 1) {
          countElem.innerHTML = "00:0" + incoming.counter;
        } else {
          countElem.innerHTML = "00:" + incoming.counter;
        }

        highscoreElem.innerHTML = "Score: " + incoming.highscore;
        playerCountElem.innerHTML = "Playercount: " + incoming.playerCount;
        gameoverScoreElem.innerHTML = "Your Score: " + incoming.highscore;

        // show diffuse count when updating all values
        //diffuseCountElem.innerHTML = "Diffuses left: " + diffuseCount;

        if (incoming.playerCount < 2) {
          waitingElem.classList.add("show-waiting");
        } else {
          waitingElem.classList.remove("show-waiting");
        }

        break;

      case 'gameOver':
        onGameOver(incoming.reason);

        break;

      case 'reset':
        location.reload();

        break;

      default:
        break;
    }
  }
});

/********************************************************************
 *  start screen (overlay)
 */
// start screen HTML elements
const startScreenDiv = document.getElementById("start-screen");
const startScreenTextDiv = startScreenDiv.querySelector("p");

// open start screen
startScreenDiv.style.display = "block";
setOverlayText("touch screen to start");

// start after touch
startScreenDiv.addEventListener("touchend", onStartScreenClick);
startScreenDiv.addEventListener("mouseup", onStartScreenClick);

function onStartScreenClick() {
  startScreenDiv.removeEventListener("touchend", onStartScreenClick);
  startScreenDiv.removeEventListener("mouseup", onStartScreenClick);

  if (matchMedia('(hover:hover)').matches) {
    listenForMousePointer();
  } else {
    listenForTouch();

    // setOverlayText("checking for motion sensors...");
    // requestDeviceOrientation()
    //   .then(() => startScreenDiv.style.display = "none") // close start screen (everything is ok)
    //   .catch((error) => setOverlayError(error)); // display error
  }

  startScreenDiv.style.display = "none";
}

// display text on start screen
function setOverlayText(text) {
  startScreenTextDiv.classList.remove("error");
  startScreenTextDiv.innerHTML = text;
}

/****************************************************************
 * touch listeners
 */
window.addEventListener('touchstart', onTouchStart, false);
window.addEventListener('touchend', onTouchEnd, false);
window.addEventListener('touchmove', (e) => e.preventDefault(), false);

let touchDown = false;
function onTouchStart(e) {
  touchDown = (e.touches.length > 0);
}

function onTouchEnd(e) {
  touchDown = (e.touches.length > 0);
  lastX = lastY = null;
}

/********************************************************************
 * overlay
 */
// display error message on start screen
function setOverlayError(text) {
  startScreenTextDiv.classList.add("error");
  startScreenTextDiv.innerHTML = text;
}

/****************************************************************
 * touch and mouse pointer event listeners
 */
// touch listener
function listenForTouch() {
  // window.addEventListener('touchstart', onPointerStart, false);
  // window.addEventListener('touchmove', onPointerMove, false);
  // window.addEventListener('touchend', onPointerEnd, false);
  // window.addEventListener('touchcancel', onPointerEnd, false);

  window.addEventListener('touchend', clientClick);
}

// mouse pointer listener
function listenForMousePointer() {
  window.addEventListener('click', clientClick);
}

function clientClick(e) {

  console.log("interval running:" + isIntervalRunning);

  // check diffuses
  if (diffuseCount > 0) {

    diffuseCount--;

    diffuseCountElem.innerHTML = "Diffuses left: " + diffuseCount;

    if (isIntervalRunning == false) {
      console.log("interval starts running");
      clientIntervalID = setInterval(updateDiffuseInterval, 3000);
      isIntervalRunning = true;
    }

    // create click message
    const countOut = {
      selector: 'clientClick'
    };
    // click message to server
    const str = JSON.stringify(countOut);
    socket.send(str);
  } else if (diffuseCount == 0) {
    diffuseCountElem.classList.add("no-diffuses-left");
    setTimeout(() => {
      diffuseCountElem.classList.remove("no-diffuses-left");
    }, 200);
    
  }
}

function onGameOver(reason) {
  console.log("recieve game over message");

  // show gameOver screen
  gameoverElem.classList.add("showOver");
  gameoverReasonElem.innerHTML = reason;

  // remove the click eventlisteners for the screen
  window.removeEventListener('touchend', clientClick);
  window.removeEventListener('click', clientClick);

  // create eventlisteners for the restart button
  gameRestartElem.addEventListener('touchend', requestReset);
  gameRestartElem.addEventListener('click', requestReset);
}

function requestReset() {
  console.log("request restart");
  // send reset befehl to server if one player clicks the restart button
  const countOut = {
    selector: 'resetRequest'
  };
  // send paint stroke to server
  const str = JSON.stringify(countOut);
  socket.send(str);
}

function updateDiffuseInterval() {
  console.log("updating interval function");
  diffuseCount++;

  if (diffuseCount >= maxDiffuses) {
    diffuseCount = maxDiffuses;
    clearInterval(clientIntervalID);
    clientIntervalID = 0;
    console.log("interval stopped");
    isIntervalRunning = false;
  }

  diffuseCountElem.innerHTML = "Diffuses left: " + diffuseCount;
}