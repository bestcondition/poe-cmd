import fs from "fs";
import os from "os";
import path from "path";
import {deepmergeInto} from "deepmerge-ts";

const homedir = os.homedir();
const settings_folder = path.join(homedir, '.config', 'poe-cmd');
const settings_file = 'config.json';
const settings_path = path.join(settings_folder, settings_file);
if (!fs.existsSync(settings_folder)) {
    fs.mkdirSync(settings_folder);
}

export function write_settings(obj) {
    fs.writeFileSync(settings_path, JSON.stringify(obj, null, 2));
}

if (!fs.existsSync(settings_path)) {
    write_settings({})
}
const settings_content = fs.readFileSync(settings_path, 'utf-8');
const settings = JSON.parse(settings_content);
export const app_settings = {
    default_headers: {
        'authority': 'poe.com',
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cookie': '',
        'referer': 'https://poe.com/ChatGPT',
        'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    },
    settings_fetch_extra_headers: {
        'pragma': 'no-cache',
        'cache-control': 'no-cache',
    },
    query_fetch_url: 'https://poe.com/api/gql_POST',
    settings_fetch_url: 'https://poe.com/api/settings',
    query_body_base: {
        'queryName': 'chatHelpers_sendMessageMutation_Mutation',
        'variables': {
            'chatId': 0,
            'bot': 'chinchilla',
            'query': '',
            'source': null,
            'withChatBreak': false,
            'clientNonce': '',
            'sdid': ''
        },
        'query': 'mutation chatHelpers_sendMessageMutation_Mutation(\n  $chatId: BigInt!\n  $bot: String!\n  $query: String!\n  $source: MessageSource\n  $withChatBreak: Boolean!\n  $clientNonce: String\n  $sdid: String\n) {\n  messageEdgeCreate(chatId: $chatId, bot: $bot, query: $query, source: $source, withChatBreak: $withChatBreak, clientNonce: $clientNonce, sdid: $sdid) {\n    chatBreak {\n      cursor\n      node {\n        id\n        messageId\n        text\n        author\n        suggestedReplies\n        creationTime\n        state\n      }\n      id\n    }\n    message {\n      cursor\n      node {\n        id\n        messageId\n        text\n        author\n        suggestedReplies\n        creationTime\n        state\n        clientNonce\n        contentType\n        chat {\n          shouldShowDisclaimer\n          id\n        }\n      }\n      id\n    }\n    status\n  }\n}\n'
    },
    query_extra_headers: {
        'content-type': 'application/json',
        'origin': 'https://poe.com',
        'poe-formkey': '',
        'poe-tag-id': '',
        'poe-tchannel': '',
        'traceparent': ''
    },
    md5_salt: 'WpuLMiXEKKE98j56k'
}
deepmergeInto(app_settings, settings);