import { Block, generateBlockHash } from "./block.js"

export const GENESIS: Block = {
    timestamp: 0,
    lastHash: "",
    data: "genesis",
    hash: generateBlockHash(0, "", "genesis")
};

