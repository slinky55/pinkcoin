import { Block, checkBlockTypes, checkHash, compareBlocks } from "./block.js";

import { GENESIS } from "./genesis.js";

export let blockchain: Block[] = [GENESIS];

export function latestBlock(): Block {
    return blockchain[blockchain.length - 1];
}

export function checkChain(c: Block[]): boolean {
    if (!compareBlocks(c[0], GENESIS) || !checkBlockTypes(c[0])) {
        console.log("Failed to validate chain, invalid genesis");
        return false;
    }

    for (let i = 1; i < c.length; i++) {
        if (!checkBlockTypes(c[i])) {
            console.log("Failed to validate hash, found invalid block types");
            return false;
        }

        if (!checkHash(c[i])) {
            console.log("Failed to validate chain, found invalid block hash");
        }

        if (c[i].lastHash != c[i - 1].hash) {
            console.log("Failed to validate chain, found invalid last hash");
            return false;
        }
    }

    return true;
}

export function addBlock(b: Block): boolean {
    if (!checkBlockTypes(b)) {
        console.log("Failed to add block, invalid block types");
        return false;
    }

    if (!checkHash(b)) {
        console.log("Failed to add block, invalid hash");
        return false;
    }

    if (b.lastHash != latestBlock().hash) {
        console.log("Failed to add block, invalid last hash");
        return false;
    }

    blockchain.push(b);
}