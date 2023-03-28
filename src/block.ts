import CryptoJS from "crypto-js";

export type Block = {
    timestamp: number,
    lastHash: string,
    data: string,
    hash: string
}

export function checkBlockTypes(b: Block) {
    return (typeof b.timestamp == "number") &&
           (typeof b.lastHash === "string") &&
           (typeof b.data === "string") && 
           (typeof b.hash === "string");
}

export function compareBlocks(a: Block, b: Block): boolean {
    return (
        JSON.stringify(a) === JSON.stringify(b)
    )
}

export function generateBlockHash(
    timestamp: number, 
    lastHash: string, 
    data: string
): string {
   return CryptoJS.SHA256(timestamp + lastHash + data).toString();
}

export function checkHash(b: Block): boolean {
    return b.hash == generateBlockHash(b.timestamp, b.lastHash, b.data);
}

export function generateBlock(
    lastHash: string,
    data: string
): Block {
    const timestamp: number = new Date().getTime();

    const hash: string = 
        generateBlockHash(timestamp, lastHash, data);

    return {
        timestamp,
        lastHash,
        data,
        hash
    }
}