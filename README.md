# CoCount

In this example, multiple clients can paint on this device and watch the common painting on a public web display.

By default the example uses a local web server.

The follwing files are important:
- `index.html`/`client.js`: the web client that allows to paint
- `board.html`/`board.js`:  the web client that displays the common painting
- `max-receiver.maxpat`: a Max patch receiving the data using a *jweb* object 
- `server.js`: the node.js web and websocket server

To run the example with a local server:
- install the node packages: `npm install`
- launch the server: `node server.js`
- open the board `localhost:3000/board.html`
- open the client webpage `localhost:3000`

Interaktionsdesign Workshop 4 - CoCount
Verbesserungsidee:
- Sound wenn jemand "restart" geclickt hat
- jeder Spieler hat ein Pseudonym
- Scoreboard:   Spieler (mit Pseudonym) der besonders gut/viel gedrückt hat
		        Spieler der besonders oft verkackt hat
                jedem Spieler anzeigen, welche zwei Spieler verkackt haben
- evtl. drei gleichzeitig drücken als abbruch bei vielen Spielern
- Spielstart auf Leute warten? Anzeigen wie viele Leute start gedrückt haben?