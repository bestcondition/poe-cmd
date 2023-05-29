import {app_settings} from "./config";
import {SettingsGetter} from "./poe_http";
import {POEClient} from "./poe_client";
import {app_init} from "./app_init";

async function server_forever() {
    const settings_getter = new SettingsGetter()
    const channel = app_settings.query_fetch_extra_headers["poe-tchannel"]
    const poe_settings = await settings_getter.get_settings(channel)
    const poe_client = new POEClient(poe_settings)
    await poe_client.start()
}

async function main() {
    if (process.argv[2] === 'init') {
        await app_init(process.argv[3], process.argv[4])
    } else {
        try {
            await server_forever()
        } catch (e) {
            console.log(e)
            console.log('please check your cookie')
            console.log('if you want to init, please run: poe-cmd init <your cookie> <your channel>')
        }
    }
}

main().then(() => {
})
