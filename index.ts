import {app_settings, write_settings} from "./config";
import {SettingsGetter} from "./poe_http";
import {POEClient} from "./poe_client";

async function main() {
    const settings_getter = new SettingsGetter()
    const channel = app_settings.query_extra_headers["poe-tchannel"]
    const poe_settings = await settings_getter.get_settings(channel)
    app_settings.query_extra_headers["poe-tchannel"] = poe_settings.tchannelData.channel
    write_settings(app_settings)
    const poe_client = new POEClient(poe_settings)
    poe_client.start()
}

main().then(() => {
})
