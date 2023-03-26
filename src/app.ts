import express from 'express';
import bodyparser from 'body-parser';

import { LatestMessage, broadcast, connectToPeer, initP2P, peers } from './sockets.js';

import { Block, generateBlock } from './block.js';
import { blockchain } from "./block.js";

const app = express();
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())

app.get("/blocks", (req, res) => {
  res.send(blockchain);
});

app.post("/blocks", (req, res) => {
  const block: Block = generateBlock(req.body.data);
  broadcast(LatestMessage());
  res.send(block);
});

app.get("/peers", (req, res) => {
  const data = peers.map((ws: any) => {
    return ws._socket.remoteAddress + ":" + ws._socket.remotePort;
  })
  res.send(data);
});

app.post("/peers", (req, res) => {
  connectToPeer(req.body.peer);
  res.send();
});

initP2P();
app.listen(5173, () => {
  console.log("listening on port 5173");
});