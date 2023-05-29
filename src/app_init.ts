import {app_settings} from "./config";
import {HomePageVisitor, SettingsGetter} from './poe_http';
import {load, CheerioAPI} from "cheerio";
import * as vm from 'vm';
import {v4 as uuid4} from 'uuid';


class HomePageParser {
    visitor: HomePageVisitor
    parser: CheerioAPI
    settings_getter: SettingsGetter

    constructor() {
        this.visitor = new HomePageVisitor()
        this.settings_getter = new SettingsGetter()
    }

    async load() {
        const html_text = await this.visitor.visit_home_page()
        this.parser = load(html_text)
    }

    get_form_key() {
        const code = this.parser('head > script:nth-of-type(1)').text();
        const fake_window: any = {}
        const context = vm.createContext({window: fake_window});
        vm.runInContext(code, context);
        return fake_window[Object.keys(fake_window)[0]]()
    }

    get_chat_id() {
        const obj = JSON.parse(this.parser('#__NEXT_DATA__').text())
        return obj.props.pageProps.payload.chatOfBotDisplayName.chatId
    }

    async get_channel() {
        const poe_settings = await this.settings_getter.get_settings()
        return poe_settings.tchannelData.channel
    }
}

export async function app_init(cookie: string, channel: string) {
    app_settings.user_settings.settings.cookie = cookie
    app_settings.user_settings.settings.channel = channel
    app_settings.user_settings_sync_to_app_settings()
    const parser = new HomePageParser()
    await parser.load()
    const form_key = parser.get_form_key()
    console.log(`get form key: ${form_key}`)
    app_settings.user_settings.settings.form_key = form_key
    const chat_id = parser.get_chat_id()
    console.log(`get chat id: ${chat_id}`)
    app_settings.user_settings.settings.chat_id = chat_id
    const device_id = uuid4()
    console.log(`generate device id: ${device_id}`)
    app_settings.user_settings.settings.device_id = device_id
    app_settings.user_settings_sync_to_app_settings()
    app_settings.save()
    console.log('app init success!')
    console.log(`save settings to '${app_settings.user_settings.settings_path}'`)
}