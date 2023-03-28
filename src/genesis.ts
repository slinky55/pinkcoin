import { Block, generateBlockHash } from "./block.js"
import { DIFF } from "./blockchain.js";

export const GENESIS: Block = {
    timestamp: 0,
    lastHash: "",
    data: "genesis",
    hash: generateBlockHash(0, "", "genesis", 0, 3),
    nonce: 0,
    difficulty: 3,
};

