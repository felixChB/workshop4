# CoCount - Bombdiffuse

CoCount - Bombdiffuse is a kooperative multiplayer game, where the players have to stop a bomb from exploding.
By clicking the screen the timer can be counted back. But be careful, only one player at a time can click or the bomb will explode.

By default the example uses a local web server.

The follwing files are important:
- `index.html`/`client.js`: the web client that allows to play
- `server.js`: the node.js web and websocket server

To run the example with a local server:
- install the node packages: `npm install`
- launch the server: `node server.js`
- open the client webpage `localhost:3000`

Interaktionsdesign Workshop 4 - CoCount-Bombdiffuse
Verbesserungsidee:
- Sound wenn jemand "restart" geclickt hat
- jeder Spieler hat ein Pseudonym
- Scoreboard:   Spieler (mit Pseudonym) der besonders gut/viel gedrückt hat
		        Spieler der besonders oft verkackt hat
                jedem Spieler anzeigen, welche zwei Spieler verkackt haben
- evtl. drei gleichzeitig drücken als Abbruch bei vielen Spielern
- Spielstart auf Leute warten
- Anzeigen wie viele Leute start gedrückt haben