import express from 'express';
import WebSocket from 'ws';
// import https from 'https';
import http from 'http';

let highscoreCount = 0;
let isPlaying = false;
let isGameOver = false;
const maxBombCount = 20;
let bombCounter = maxBombCount;
var myIntervalID = 0;
let numPlayerStarted = 0;

let lastClickTime = -Infinity;
let lastClickingClient = null;

// const key = fs.readFileSync('sslcert/selfsigned.key', 'utf8');
// const cert = fs.readFileSync('sslcert/selfsigned.crt', 'utf8');
// const credentials = { key, cert };
// openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout sslcert/selfsigned.key -out sslcert/selfsigned.crt

////////////////////////////////////////////////////////////////////////////////////
//                                  http

const httpPort = Number(process.env.PORT) || 3000;
const app = express();

// const httpsServer = https
//   .createServer(credentials, app)
//   .listen(httpPort, () => console.log(`HTTP server listening on port ${httpPort}`));

const httpServer = http
  .createServer(app)
  .listen(httpPort, () => console.log(`HTTP server listening on port ${httpPort}`));

app.use(express.static('.'));

////////////////////////////////////////////////////////////////////////////////////
//                              websocket server

// const webSocketServer = new WebSocket.Server({ server: httpsServer });
const webSocketServer = new WebSocket.Server({ server: httpServer });
console.log(`websocket server listening`);

//const timeStart = performance.now();

const boardSockets = new Set();
const clientSockets = new Set();
//const clickingClients = new Map();

////////////////////////////////////////////////////////////////////////////////////
//                  listen to new web socket connections

webSocketServer.on('connection', (socket, req) => {

  //board connection
  if (req.url === '/board') {
    // add new board
    boardSockets.add(socket);

    // remove board (when connection closes)
    socket.on('close', () => {
      boardSockets.delete(socket);
    });

    // player connection
  } else {
    clientSockets.add(socket);

    socket.on('close', () => {
      clientSockets.delete(socket);
      //numPlayerStarted--;
    });

    console.log("PlayerCounter: " + clientSockets.size);

    // send
    sendInfoToClient();
  }

  ////////////////////////////////////////////////////////////////////////////////////
  //                            listen to client messages

  socket.on('message', (message) => {
    if (message.length === 0) {
      // receive ping from client and respond with pong message
      socket.send('');
    } else {
      const incoming = JSON.parse(message);

      // dispatch incoming messages
      switch (incoming.selector) {
        case 'clientClick':
          checkIncomingClicks(socket);
          bombCounter += 2;
          if (bombCounter >= maxBombCount) {
            bombCounter = maxBombCount;
          }
          sendInfoToClient();

          break;
        case 'resetRequest':
          resetGame();

          break;

        case 'startGameScreen':
          numPlayerStarted++;
          console.log(numPlayerStarted);

          checkForGameStart();

          break;
      }
    }
  });
});

function sendInfoToClient(client = null) {
  //console.log("send info");
  let isMax = false;
  if (bombCounter == maxBombCount) {
    isMax = true;
  } else {
    isMax = false;
  }

  const messageObj = {
    selector: 'info',
    counter: bombCounter,
    highscore: highscoreCount,
    playerCount: clientSockets.size.toString(),
    isMax: isMax
  };

  const str = JSON.stringify(messageObj);

  if (client) {
    // send counter to a specific client
    client.send(str);
  } else {
    // send counter to all clients
    for (let client of clientSockets) {
      client.send(str);
    }
  }
}

function checkIncomingClicks(client) {

  const clickTime = performance.now();

  if (client !== lastClickingClient) {

    let timeDifClicks = clickTime - lastClickTime;

    if (timeDifClicks < 500) {
      gameOver("Two people clicked");
    }
  }

  lastClickTime = clickTime;
  lastClickingClient = client;
}

function updateInInterval() {
  highscoreCount++;
  bombCounter--;

  if (bombCounter < 0) {
    gameOver("Timer up");
    bombCounter = 0;
  } else {
    sendBombSoundInfo("tick");
  }

  sendInfoToClient();
}

function gameOver(reason) {
  sendBombSoundInfo("explosion");
  console.log("Game Over with Reason: " + reason);
  isPlaying = false;
  isGameOver = true;
  clearInterval(myIntervalID);
  myIntervalID = 0;

  const messageObj = {
    selector: 'gameOver',
    counter: bombCounter,
    highscore: highscoreCount,
    reason: reason
  };

  const str = JSON.stringify(messageObj);

  for (let client of clientSockets) {
    client.send(str);
  }
}

function resetGame() {
  console.log("Reset Game!")
  //reset variables
  highscoreCount = 0;
  isPlaying = false;
  isGameOver = false;
  bombCounter = maxBombCount;
  clearInterval(myIntervalID);
  myIntervalID = 0;
  numPlayerStarted = 0;

  lastClickTime = -Infinity;
  lastClickingClient = null;

  const messageObj = {
    selector: 'reset',
  };
  const str = JSON.stringify(messageObj);
  for (let client of clientSockets) {
    client.send(str);
  }
}

function checkForGameStart() {
  if (numPlayerStarted >= 2) {
    if (isGameOver == false) {
      if (isPlaying == false) {
        console.log("Start Game!");
        myIntervalID = setInterval(updateInInterval, 1000);
        isPlaying = true;
      }
    }
  }
}

function sendBombSoundInfo(whichSound) {
  const messageObj = {
    selector: 'bombSound',
    whichSound: whichSound
  };
  const str = JSON.stringify(messageObj);
  for (let client of clientSockets) {
    client.send(str);
  }
}