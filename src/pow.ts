import { Block, blockchain, genHash, latestBlock } from "./block.js";

import { toBitString } from "./util.js";

export const BLOCK_GENERATION_INTERVAL = 10;
export const DIFFICULTY_ADJ_INTERVAL = 10;

export function checkDifficulty(hash: string,
                                difficulty: number): boolean
{
    const bits: string = toBitString(hash);
    return bits.startsWith('0'.repeat(difficulty));
}

export function findBlock(idx: number,
                          prevHash: string,
                          timestamp: number,
                          data: string,
                          difficulty: number): Block
{
    let nonce = 0;
    while (true) {
        const hash: string = genHash(idx, prevHash, timestamp, data, difficulty, nonce);
        if (checkDifficulty(hash, difficulty)) {
            return {
                idx,
                hash,
                prevHash,
                timestamp,
                data,
                difficulty,
                nonce
            }
        }
        nonce++;
    }
}   

export function getDifficulty(chain: Block[]): number {
    const latest: Block = chain[chain.length - 1];
    if (latest.idx % DIFFICULTY_ADJ_INTERVAL === 0 && latest.idx !== 0) {
        return getAdjustedDifficulty(chain, latest);
    } else {
        return latest.difficulty;
    }
};

export function getAdjustedDifficulty (chain: Block[], latestBlock: Block): number {
    const prevAdjustmentBlock: Block = chain[chain.length - DIFFICULTY_ADJ_INTERVAL];
    const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJ_INTERVAL;
    const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
};

export function getAccumDifficulty(chain: Block[]): number {
    return chain
        .map((block) => block.difficulty)
        .map((difficulty) => Math.pow(2, difficulty))
        .reduce((a, b) => a + b);
}