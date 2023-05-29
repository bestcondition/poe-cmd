import fs from "fs";
import os from "os";
import path from "path";


interface UserSettings {
    cookie?: string
    channel?: string
    form_key?: string
    chat_id?: number
    device_id?: string
}

class UserSettingsManager {
    settings_path: string
    settings: UserSettings

    constructor() {
        const homedir = os.homedir();
        const settings_folder = path.join(homedir, '.config', 'poe-cmd');
        const settings_file = 'config.json';
        const settings_path = path.join(settings_folder, settings_file);
        this.settings_path = settings_path;
        if (!fs.existsSync(settings_folder)) {
            fs.mkdirSync(settings_folder, {recursive: true});
        }
        if (!fs.existsSync(settings_path)) {
            this.settings = {}
            this.write_settings()
        } else {
            const settings_content = fs.readFileSync(settings_path, 'utf-8');
            this.settings = JSON.parse(settings_content);
        }
    }

    write_settings() {
        fs.writeFileSync(this.settings_path, JSON.stringify(this.settings, null, 2));
    }


}


class AppSettings {
    default_headers = {
        'authority': 'poe.com',
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cookie': '',
        'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    }
    settings_fetch_url = 'https://poe.com/api/settings'
    settings_fetch_extra_headers = {
        'referer': 'https://poe.com/ChatGPT',
        'pragma': 'no-cache',
        'cache-control': 'no-cache',
    }
    graph_ql_send_url = 'https://poe.com/api/gql_POST'
    query_fetch_extra_headers = {
        'referer': 'https://poe.com/ChatGPT',
        'content-type': 'application/json',
        'origin': 'https://poe.com',
        'poe-formkey': '',
        'poe-tag-id': '',
        'poe-tchannel': '',
        'traceparent': ''
    }
    query_fetch_body_base = {
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
    }
    home_page_fetch_url = 'https://poe.com/ChatGPT'
    home_page_fetch_extra_headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
    }
    md5_salt: string = 'WpuLMiXEKKE98j56k'
    user_settings: UserSettingsManager

    constructor() {
        this.user_settings = new UserSettingsManager();
        this.user_settings_sync_to_app_settings()
    }

    user_settings_sync_to_app_settings() {
        if (this.user_settings.settings.cookie) {
            this.default_headers.cookie = this.user_settings.settings.cookie
        }
        if (this.user_settings.settings.channel) {
            this.query_fetch_extra_headers['poe-tchannel'] = this.user_settings.settings.channel
        }
        if (this.user_settings.settings.device_id) {
            this.query_fetch_body_base.variables.sdid = this.user_settings.settings.device_id
        }
        if (this.user_settings.settings.form_key) {
            this.query_fetch_extra_headers['poe-formkey'] = this.user_settings.settings.form_key
        }
        if (this.user_settings.settings.chat_id) {
            this.query_fetch_body_base.variables.chatId = this.user_settings.settings.chat_id
        }
    }

    app_settings_sync_to_user_settings() {
        this.user_settings.settings.cookie = this.default_headers.cookie
        this.user_settings.settings.channel = this.query_fetch_extra_headers['poe-tchannel']
        this.user_settings.settings.device_id = this.query_fetch_body_base.variables.sdid
        this.user_settings.settings.form_key = this.query_fetch_extra_headers['poe-formkey']
        this.user_settings.settings.chat_id = this.query_fetch_body_base.variables.chatId
        this.save()
    }

    save() {
        this.user_settings.write_settings()
    }
}


export const app_settings = new AppSettings()