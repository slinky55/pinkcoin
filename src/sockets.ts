import WebSocket from "ws";
import { WebSocketServer } from "ws";
import Server from "ws";

import { Block, addBlock, blockchain, checkBlockTypes, checkChain, latestBlock, replaceChain } from "./block.js";

export const peers: WebSocket[] = [];

export enum MessageType {
    Q_BLOCKCHAIN,
    Q_LATEST,
    I_BLOCKCHAIN,
    I_LATEST,
} 

export type Message = {
    type: MessageType,
    data: any,
}

export function LatestMessage(): Message {
    return {
        type: MessageType.I_LATEST,
        data: [latestBlock()]
    }
}

export function initP2P() { 
    const server: WebSocketServer = new WebSocketServer({port: 4201});
    server.on("connection", initSocket);
}

export function connectToPeer(p: string): void {
    const ws: WebSocket = new WebSocket(p);

    ws.on("open", () => {
        initSocket(ws);
    });

    ws.on("error", () => {
        console.log("Connection failed from: " + ws.url);
    });
}

function write(ws: WebSocket,
               msg: Message): void
{
    ws.send(JSON.stringify(msg));
}

export function broadcast(msg: Message): void {
    peers.forEach((peer: WebSocket) => {
        write(peer, msg);
    });
}

function initSocket(ws: WebSocket) {
    peers.push(ws);

    ws.on("message", (data: string) => {
        const message: Message = JSON.parse(data);
        if (!message) {
            console.log("Failed to receive message from: " +  ws.url);
            return;
        }

        switch (message.type) {
            case MessageType.Q_LATEST:
                write(ws, LatestMessage());
                break;
            case MessageType.Q_BLOCKCHAIN:
                write(ws, {
                    type: MessageType.I_BLOCKCHAIN,
                    data: blockchain,
                })
                break;
            case MessageType.I_BLOCKCHAIN || MessageType.I_LATEST:
                try {
                    const bc: Block[] = JSON.parse(message.data);

                    if (!bc) {
                        console.log("invalid blockchain recieved"); 
                        break;
                    }

                    if (bc.length === 0) {
                        console.log("error: empty blockchain received");
                        break;
                    }

                    const recLatest: Block = bc[bc.length - 1];
                    if (!checkBlockTypes(recLatest)) {
                        console.log("error: latest block not valid");
                        break;
                    }

                    if (bc.length === 1) {
                        broadcast({
                            type: MessageType.Q_BLOCKCHAIN,
                            data: null,
                        })
                        break;
                    }

                    const localLatest: Block = latestBlock();
                    if (recLatest.idx > localLatest.idx) {
                        if (localLatest.hash === recLatest.prevHash) {
                            if (addBlock(recLatest)) {
                                broadcast(LatestMessage())
                            }
                        } else {
                            replaceChain(bc);
                            broadcast(LatestMessage())
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
                break;
        }
    }); 

    ws.on("close", () => peers.splice(peers.indexOf(ws), 1));
    ws.on("error", () => peers.splice(peers.indexOf(ws), 1));

    // TODO: Probably broadcast
}