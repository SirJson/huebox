import * as dotenv from 'sys/dotenv'
export interface AppConfig {
    host: string,
    port: string,
    pageRoot: string
    hue: {
        bridgeIp: string
        token: string
    }
}

export let GlobalConfig: AppConfig;

export function readConfig(): AppConfig {
    const envvars = dotenv.config({ safe: true })
    const output: AppConfig = {
        pageRoot: envvars['PAGE_ROOT'],
        host: envvars['HOST'],
        port: envvars['PORT'],
        hue: {
            bridgeIp: envvars['HUE_IP'],
            token: envvars['HUE_TOKEN']
        }
    }
    return output;
}

export function loadConfig() {
    GlobalConfig = readConfig();
}