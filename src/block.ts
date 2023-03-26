import CryptoJS from "crypto-js";
import { findBlock, getAccumDifficulty, getDifficulty } from "./pow.js";
import { checkHash, checkTimestamp, currentTimestamp } from "./util.js";

const genesis: Block = {
    idx: 0,
    hash: "vyD7PVrzrI81r7yU9BtcAqZycY2qU8Se",
    prevHash: null,
    timestamp: new Date().getTime() / 1000,
    data: "Genesis",
    difficulty: 0,
    nonce: 0,
}

export let blockchain: Block[] = [genesis];

export type Block = {
    idx: number,
    hash: string,
    prevHash: string | null,
    timestamp: number,
    data: string,
    difficulty: number,
    nonce: number,
}

export function latestBlock(): Block {
    return blockchain[blockchain.length - 1];
}

export function genHash(
    idx: number,
    prevHash: string,
    timestamp: number,
    data: string,
    difficulty: number,
    nonce: number
): string | null {
    return CryptoJS.SHA256(
        idx + prevHash + timestamp + data + difficulty + nonce
    ).toString();
}

export function genHashFromBlock(block: Block): string | null {
    return CryptoJS.SHA256(
        block.idx + block.prevHash + block.timestamp + block.data + block.difficulty + block.nonce
    ).toString();
}

export function checkBlock(block: Block, prev: Block): boolean {
    if (prev.idx + 1 !== block.idx) {
        console.log("Check block failed, invalid index!");
        return false;
    }
    if (prev.hash !== block.prevHash) {
        console.log("Check block failed, invalid previous hash!");
        return false;
    }

    if (genHashFromBlock(block) !== block.hash) {
        console.log("Check block failed, invalid hash!");
        return false;
    }

    if (!checkTimestamp(block, prev)) {
        console.log("Check block failed, invalid timestamp");
        return false;
    }

    if (!checkHash(block)) {
        console.log("Check block failed, failed to validate hash");
    }

    return true;
}

export function checkBlockTypes(block: Block): boolean {
    return typeof block.idx === "number" &&
           typeof block.hash === "string" &&
           typeof block.prevHash === "string" &&
           typeof block.timestamp === "number" &&
           typeof block.data === "string";
}

export function checkChain(chain: Block[]): boolean {
    if (chain[0] !== genesis) {
        console.log("Check chain failed, invalid genesis!");
        return false;
    }

    for (let i = 1; i < chain.length; i++) {
        if (!checkBlock(chain[i], chain[i - 1])) {
            console.log("Check chain failed, invalid block found in chain");
            return false;
        }
    }   

    return true;
}

export function replaceChain(chain: Block[]): void {
    if (checkChain(chain) &&
        chain.length > blockchain.length &&
        getAccumDifficulty(chain) > getAccumDifficulty(blockchain)) {
        blockchain = chain;
    } else {
        console.log("failed to replace, invalid chain");
    }
}

export function addBlock(block: Block): boolean {
    if (checkBlock(block, latestBlock())) {
        blockchain.push(block);
        return true;
    } else {
        console.log("failed to generate block");
        return false;
    }
}

export function generateBlock(data: string): Block | null {
    const prevBlock: Block = latestBlock();
    const idx: number = prevBlock.idx + 1;
    const timestamp: number = currentTimestamp();
    
    const block: Block = findBlock(idx, prevBlock.hash, timestamp, data, getDifficulty(blockchain));

    if (!addBlock(block)) return null;

    return block;
}