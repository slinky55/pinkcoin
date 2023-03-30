import CryptoJS from "crypto-js";
import { DIFF } from "./blockchain.js";
import { hexToBin } from "./utils.js";

export type Block = {
    timestamp: number,
    lastHash: string,
    data: string,
    hash: string,
    nonce: number,
    difficulty: number,
}

export function checkBlockTypes(b: Block) {
    return (typeof b.timestamp == "number") &&
           (typeof b.lastHash === "string") &&
           (typeof b.data === "string") && 
           (typeof b.hash === "string") &&
           (typeof b.nonce === "number") &&
           (typeof b.difficulty === "number");
}

export function compareBlocks(a: Block, b: Block): boolean {
    return (
        JSON.stringify(a) === JSON.stringify(b)
    )
}

export function generateBlockHash(
    timestamp: number, 
    lastHash: string, 
    data: string,
    nonce: number,
    diff: number
): string {
   return CryptoJS.SHA256(timestamp + lastHash + data + nonce + diff).toString();
}

export function checkBlockHash(b: Block): boolean {
    return b.hash == generateBlockHash(b.timestamp, b.lastHash, b.data, b.nonce, b.difficulty);
}

export function checkHashDiff(h: string, diff: number): boolean {
    return h.substring(0, diff) === '0'.repeat(diff);
}

export function generateBlock(
    lastBlock: Block,
    data: string
): Block {
    const lastHash: string = lastBlock.hash;
    const difficulty: number = DIFF;
    let nonce: number = 0;
    let timestamp: number = 0;
    let hash: string = "";
    
    while (true) {
        timestamp = new Date().getTime();
        hash = generateBlockHash(timestamp, lastHash, data, nonce, difficulty);
        if (checkHashDiff(hexToBin(hash), difficulty)) break;
        nonce++;
    }

    return {
        timestamp,
        lastHash,
        data,
        hash,
        difficulty,
        nonce,
    }
}

export function checkBlock(b: Block): boolean {
    if (!checkBlockTypes(b)) {
        console.log("Failed to validate block, invalid block types");
        return false
    }

    if (!checkBlockHash(b)) {
        console.log("Failed to validate block, invalid block hash");
        return false
    }

    if (!checkHashDiff(hexToBin(b.hash), b.difficulty)) {
        console.log("Failed to validate block, invalid hash difficulty");
        return false
    }
}