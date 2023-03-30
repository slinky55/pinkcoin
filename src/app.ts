import express from "express";
import bodyParser from "body-parser";

import { blockchain, mineBlock } from "./blockchain.js";
import { Block } from "./block.js";
import {broadcast, ChainQuery, initP2P, initPeer, LatestInfo, peers} from "./peers.js";

const app = express();
app.use(bodyParser.json())

app.get("/api/blocks", (req, res) => {
  res.send(blockchain);
});

app.post("/api/blocks", (req, res) => {
  const data: string = req.body.data;
  const block: Block = mineBlock(data);
  res.send(block);
});

app.get("/api/peers", (req, res) => {
  res.send(peers);
});

app.post("/api/peers", (req, res) => {
  const peer: string = req.body.peer;
  initPeer(peer);
  res.send();
});

app.get("/api/sync", (req, res) => {
  broadcast(ChainQuery);
  res.send();
})

initP2P();

app.listen(7100, () => {
  console.log("Listening on port 7100");
});
