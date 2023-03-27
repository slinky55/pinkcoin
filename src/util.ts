import { Block, genHash, genHashFromBlock } from "./block.js";
import { checkDifficulty, getDifficulty } from "./pow.js";

const lookupTable = {
    '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
    '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
    'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
    'e': '1110', 'f': '1111'
};


export function currentTimestamp(): number {
    return Math.round(new Date().getTime() / 1000); 
} 

export function JSONToObject<T>(data: string): T {
    try {
        return JSON.parse(data);
    } catch(e) {
        console.log(e);
        return null;
    }
}

export const toBitString = (s: string): string => {
    let ret: string = '';
    
    for (let i: number = 0; i < s.length; i = i + 1) {
        if (lookupTable[s[i]]) {
            ret += lookupTable[s[i]];
        } else {
            return null;
        }
    }

    return ret;
};

export function checkTimestamp(block: Block, prev: Block): boolean {
    return ( prev.timestamp - 60 < block.timestamp )
        && block.timestamp - 60 < currentTimestamp();
}

export function checkHash(block: Block): boolean {
    const hash: string = genHashFromBlock(block);
    if (hash !== block.hash) {
        console.log("check hash failed, invalid hash");
        return false;
    }

    if (!checkDifficulty(block.hash, block.difficulty)) {
        console.log("check hash failed, invalid difficulty");
        return false;
    }

    return true;
}