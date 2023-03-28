import { blockchain, mineBlock } from "./blockchain.js";

for (let i = 0; i < 100; i++) {
  mineBlock("new block");
  console.log("mined block " + i + " at " + new Date().getTime());
}

console.log(blockchain);