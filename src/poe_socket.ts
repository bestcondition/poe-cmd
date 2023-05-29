import WebSocket from 'ws';
import {URL} from 'url';
import {POESettings} from './poe_http';
import {deep_copy} from './utils';

// messageAdded = {
//   "id": "xxx=",
//   "messageId": 0000,
//   "creationTime": 0000,
//   "clientNonce": "xxx",
//   "state": "complete",
//   "text": "hello",
//   "author": "human",
//   "linkifiedText": "hello",
//   "contentType": "text_markdown",
//   "suggestedReplies": [],
//   "vote": null,
//   "voteReason": null,
//   "__isNode": "Message"
// }

export enum AuthorEnum {
    human = 'human',
    chinchilla = 'chinchilla',
}

export enum StateEnum {
    complete = 'complete',
    incomplete = 'incomplete',
}

export interface MessageAdded {
    id: string;
    messageId: number;
    creationTime: number;
    clientNonce: string;
    state: string;
    text: string;
    author: string;
    linkifiedText: string;
    contentType: string;
    suggestedReplies: any[];
    vote: any;
    voteReason: any;
    __isNode: string;
}


class POESocket {
    url_pack: POESettings;
    next_url_pack: POESettings;
    ws: WebSocket;
    close_callback: () => void;
    message_handler: (data: MessageAdded) => void;


    constructor(
        url_pack: POESettings,
        close_callback?: () => void,
        message_handler?: (data: MessageAdded) => void,
    ) {
        this.url_pack = deep_copy(url_pack);
        this.next_url_pack = deep_copy(url_pack);
        this.close_callback = close_callback;
        this.message_handler = message_handler;
    }

    on_message(data: WebSocket.RawData) {
        // console.log('WebSocket message received!');
        const res = JSON.parse(data.toString())
        if (res.min_seq) {
            this.next_url_pack.tchannelData.minSeq = res.min_seq
        }
        if (res.messages) {
            for (const ms of res.messages) {
                const ms_obj = JSON.parse(ms)
                if (this.message_handler && ms_obj.payload.data.messageAdded) {
                    this.message_handler(ms_obj.payload.data.messageAdded)
                }
            }
        }
    }

    connect() {
        const url = this.url_pack_to_url(this.url_pack)
        // console.log(`Connecting to ${url}`)
        this.ws = new WebSocket(url);
        this.ws.on('open', this.on_open.bind(this));
        this.ws.on('message', this.on_message.bind(this));
        this.ws.on('close', this.on_close.bind(this));
        this.ws.on('error', this.on_error.bind(this));
    }

    disconnect() {
        this.ws.close();
    }

    url_pack_to_url(url_pack: POESettings): string {
        const protocol = "wss";
        const random_number = Math.floor(1e6 * Math.random()) + 1;
        const random_host = `tch${random_number}.tch.${url_pack.tchannelData.baseHost}`;
        const url = new URL(`${protocol}://${random_host}`);
        url.pathname = `/up/${url_pack.tchannelData.boxName}/updates`;
        url.searchParams.set('min_seq', url_pack.tchannelData.minSeq);
        url.searchParams.set('channel', url_pack.tchannelData.channel);
        url.searchParams.set('hash', url_pack.tchannelData.channelHash);
        return url.toString();
    }

    on_open() {
        // console.log('WebSocket connection established!');
    }

    on_close() {
        if (this.close_callback) {
            this.close_callback()
        }
        // console.log('WebSocket connection closed!');
    }

    on_error() {
        // console.log('WebSocket error!');
    }

}

export class POESocketManager {
    poe_socket: POESocket;
    begin_url_pack: POESettings;
    now_url_pack: POESettings;
    will_retry: boolean = true;
    message_handler: (data: MessageAdded) => void;

    constructor(url_pack: POESettings, message_handler: (data: MessageAdded) => void) {
        this.begin_url_pack = deep_copy(url_pack);
        this.now_url_pack = deep_copy(url_pack);
        this.message_handler = message_handler;
    }

    start() {
        this.start_now_url_pack()
    }

    stop() {
        this.will_retry = false
        this.poe_socket.disconnect()
        // console.log('stop')
    }

    start_now_url_pack() {
        this.poe_socket = new POESocket(
            this.now_url_pack, this.close_callback.bind(this),
            this.message_handler
        )
        this.poe_socket.connect()
    }

    close_callback() {
        if (this.will_retry) {
            // console.log('re connect')
            this.now_url_pack = this.poe_socket.next_url_pack
            this.start_now_url_pack()
        }
    }

}
