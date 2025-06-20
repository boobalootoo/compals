// server.js
const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
app.use(express.static('public')); // Serve index.html

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {}; // { roomName: { username: ws } }

wss.on('connection', (ws) => {
  let room = null, username = null;

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'join') {
        room = data.room;
        username = data.name;
        rooms[room] = rooms[room] || {};
        rooms[room][username] = { ws, last: Date.now(), data: null };
      } else if (data.type === 'update' && room && username) {
        rooms[room][username].last = Date.now();
        rooms[room][username].data = data;
        broadcast(room);
      }
    } catch {}
  });

  ws.on('close', () => {
    if (room && username && rooms[room]) {
      delete rooms[room][username];
      if (Object.keys(rooms[room]).length === 0) delete rooms[room];
    }
  });
});

function broadcast(room) {
  const users = rooms[room];
  const snapshot = {};
  for (let [name, { data }] of Object.entries(users)) {
    if (data) snapshot[name] = data;
  }
  const payload = JSON.stringify({ type: 'users', users: snapshot });
  for (let { ws } of Object.values(users)) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
}

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
