import { Block, checkBlock, checkBlockTypes, checkBlockHash, compareBlocks, generateBlock } from "./block.js";

import { GENESIS } from "./genesis.js";
import { LatestInfo, broadcast } from "./peers.js";

export const MINE_RATE: number = 1000;    // 1 second
export let DIFF: number = 3;

export let blockchain: Block[] = [GENESIS];

export function latestBlock(): Block {
    return blockchain[blockchain.length - 1];
}

export function adjustDiff(): void {
    const difference: number = 
        latestBlock().timestamp - blockchain[blockchain.length - 2].timestamp;
    
    if (difference > MINE_RATE) {
        if (DIFF === 0) return;
        DIFF--;
    } else {
        DIFF++;
    }
}

export function checkChain(c: Block[]): boolean {
    if (!compareBlocks(c[0], GENESIS) || !checkBlockTypes(c[0])) {
        console.log("Failed to validate chain, invalid genesis");
        return false;
    }

    for (let i = 1; i < c.length; i++) {
        if (!checkBlock(c[i])) {
            console.log("Failed to validate chain, found invalid block");
            return false;
        }

        if (c[i].lastHash != c[i - 1].hash) {
            console.log("Failed to validate chain, found invalid last hash");
            return false;
        }
    }

    return true;
}

export function replaceChain(c: Block[]): boolean {
    if (!checkChain(c)) {
        console.log("Replace chain failed, invalid chain");
        return false;
    }

    if (c.length <= blockchain.length) {
        console.log("Replace chain failed, received chain not longer than current.");
        return false;
    }

    blockchain = c;
    return true;
}

export function addBlock(b: Block): boolean {
    if (!checkBlockTypes(b)) {
        console.log("Failed to add block, invalid block types");
        return false;
    }

    if (!checkBlockHash(b)) {
        console.log("Failed to add block, invalid hash");
        return false;
    }

    if (b.lastHash != latestBlock().hash) {
        console.log("Failed to add block, invalid last hash");
        return false;
    }

    blockchain.push(b);
    adjustDiff();
    broadcast(LatestInfo());
    return true;
}

export function mineBlock(data: string): Block | null {
    const block: Block = generateBlock(latestBlock(), data);
    if (addBlock(block)) {
        return block;
    } else {
        return null;
    }
} 