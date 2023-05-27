import {createHash} from 'crypto';
import {URL} from "url";
import {deep_copy} from "./utils";
import {app_settings} from "./config";

export interface POESettings {
    tchannelData: {
        minSeq: string,
        channel: string,
        channelHash: string,
        boxName: string,
        baseHost: string,
        targetUrl: string,
        enableWebsocket: boolean
    }
}

// {
//   "tchannelData": {
//     "minSeq": "10568845546",
//     "channel": "poe-xxx-0000-asdf",
//     "channelHash": "12341234",
//     "boxName": "xxx-0000",
//     "baseHost": "poe.com",
//     "targetUrl": "",
//     "enableWebsocket": true
//   }
// }

export class SettingsGetter {
    get_headers() {
        return {
            ...app_settings.default_headers,
            ...app_settings.settings_fetch_extra_headers,
        }
    }

    async get_settings(channel?: string): Promise<POESettings> {
        const url = new URL(app_settings.settings_fetch_url);
        if (channel) {
            url.searchParams.append('channel', channel);
        }
        const headers = this.get_headers();
        const res = await fetch(url.toString(), {headers});
        return await res.json();
    }
}

export class QuerySender {
    get_body(query: string, client_nonce: string) {
        const body_cp = JSON.parse(JSON.stringify(app_settings.query_body_base))
        body_cp.variables.query = query
        body_cp.variables.clientNonce = client_nonce
        return JSON.stringify(body_cp)
    }

    get_headers(tar_id: string) {
        const extra_headers_cp = deep_copy(app_settings.query_extra_headers)
        extra_headers_cp['poe-tag-id'] = tar_id
        return {
            ...app_settings.default_headers,
            ...extra_headers_cp
        }
    }

    async send_query(query: string) {
        const form_key = app_settings.query_extra_headers['poe-formkey']
        const client_nonce = this.gen_client_nonce()
        const body = this.get_body(query, client_nonce)
        const tar_id = this.md5(body + form_key + app_settings.md5_salt)
        const headers = this.get_headers(tar_id)
        const res = await fetch(
            app_settings.query_fetch_url,
            {
                method: 'POST',
                headers,
                body
            }
        );
        if (res.ok) {
            return await res.json()
        } else {
            throw new Error(`Query failed with status code ${res.status}, text: ${await res.text()}`)
        }
    }

    gen_client_nonce() {
        let nonce = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 16; i++) {
            nonce += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return nonce;
    }

    md5(input: string): string {
        const md5 = createHash('md5');
        md5.update(input);
        return md5.digest('hex');
    }

}
