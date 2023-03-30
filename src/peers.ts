import WebSocket, { WebSocketServer } from "ws";
import { addBlock, blockchain, checkChain, latestBlock, replaceChain } from "./blockchain.js";
import { Block, checkBlock, compareBlocks } from "./block.js";

export const peers: WebSocket[] = [];

enum PacketType {
    I_CHAIN,
    I_LATEST,
    Q_CHAIN,
    Q_LATEST,
}

export type Packet = {
    type: PacketType
    data: any
}

export function initP2P(): void {
    const server: WebSocketServer = new WebSocketServer({port: 4201});
    server.on("connection", (ws: WebSocket) => {
        peers.push(ws);
        initSocket(ws);
    })
    console.log("started web socket server on port 4201");
}

export function initPeer(url: string): void {
    const ws: WebSocket = new WebSocket(url);
    ws.on("open", () => {
        initSocket(ws);
        peers.push(ws);
        console.log("Connected to " + ws.url);
    })
}

export function broadcast(p: Packet) {
    peers.forEach((ws: WebSocket) => {
        ws.send(JSON.stringify(p));
    });
}

export const ChainInfo = (): Packet => {
    return {
        type: PacketType.I_CHAIN,
        data: blockchain,
    }
}

export const LatestInfo = (): Packet => {
    return {
        type: PacketType.I_LATEST,
        data: latestBlock(),
    }
}

export const ChainQuery: Packet = {
    type: PacketType.Q_CHAIN,
    data: null,
}

export const LatestQuery: Packet = {
    type: PacketType.Q_LATEST,
    data: null,
}

function initSocket(ws: WebSocket): void {
    ws.on("message", (data: string) => {
        try {
            const message: Packet = JSON.parse(data);
            if (!message) {
                console.log("Failed to parse JSON");
                return;
            }

            switch (message.type) {
                case PacketType.I_CHAIN: iChainHandler(ws, message); break;
                case PacketType.I_LATEST: iLatestHandler(ws, message); break;
                case PacketType.Q_CHAIN: qChainHandler(ws, message); break;
                case PacketType.Q_LATEST: qLatestHandler(ws, message); break;
            }

        } catch (e) {
            console.log(e);
        }
    });
}

function iChainHandler(ws: WebSocket, p: Packet) {
    const chain: Block[] = p.data;

    if (!checkChain(chain)) {
        console.log("Invalid chain received from " + ws.url);
        return;
    }

    const latest: Block = chain[chain.length - 1];

    if (compareBlocks(latest, latestBlock())) {
        console.log("In sync with " + ws.url);
        return;
    }

    if (chain.length > blockchain.length) {
        if (latest.hash === latestBlock().hash) {
            console.log("Block received is next block, updating blockchain");
            addBlock(latest);
            return;
        }

        if (replaceChain(chain)) {
            console.log("Recieved new valid chain from " + ws.url);
        }
    }
}

function iLatestHandler(ws: WebSocket, p: Packet) {
    const latest: Block = p.data;

    if (!checkBlock(latest)) {
        console.log("Latest block recieved from " + ws.url + " is invalid");
        return;
    }

    if (compareBlocks(latest, latestBlock())) {
        console.log("In sync with " + ws.url);
        return;
    }

    if (latest.lastHash === latestBlock().hash) {
        console.log("Block received is next block, updating blockchain");
        addBlock(latest);
        return;
    }

    console.log("Out of sync with " + ws.url + ", querying blockchain");
    broadcast(ChainQuery);
}

function qChainHandler(ws: WebSocket, p: Packet) {
    ws.send(JSON.stringify(ChainInfo()))
}

function qLatestHandler(ws: WebSocket, p: Packet) {
    ws.send(JSON.stringify(LatestInfo()))
}
