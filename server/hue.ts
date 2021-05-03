import { GlobalConfig } from "app/config";
import { DeviceUpdate, HueLights, HueErrors, HueSuccess, Scenes, Scene, HueGroups, GroupUpdate } from "phillips/hue/model";
import { ActionResult } from 'app/common';

interface HueURIList {
    base: string,
    lights: string,
    scenes: string,
    groups: string
}

interface BasicAction {
    on: boolean
}

const uniqueStr = (v: string, i: number, s: Array<string>) => s.indexOf(v) === i

export class HueAPI {
    uris: HueURIList

    constructor() {
        const base = `http://${GlobalConfig.hue.bridgeIp}/api/${GlobalConfig.hue.token}`;
        this.uris = {
            base: base,
            lights: `${base}/lights`,
            scenes: `${base}/scenes`,
            groups: `${base}/groups`
        }
    }

    async lights(): Promise<HueLights> {
        console.log('[Hue API]', 'GET', this.uris.lights);
        const res = await fetch(this.uris.lights);
        if (!res.ok) {
            console.error(res.status, res.statusText);
        }
        return await res.json();
    }

    async groups(): Promise<HueGroups> {
        console.log('[Hue API]', 'GET', this.uris.groups);
        const res = await fetch(this.uris.groups);
        if (!res.ok) {
            console.error(res.status, res.statusText);
        }
        return await res.json();
    }

    async modifyGroup(gid: number, update: GroupUpdate): Promise<ActionResult> {
        const action = `${this.uris.groups}/${gid}/action`;
        console.log('[Hue API]', 'PUT', action, JSON.stringify(update));
        const res = await fetch(action, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(update) // body data type must match "Content-Type" header
        });
        const apiResponse: HueErrors | HueSuccess = await res.json()
        const report: ActionResult = {
            result: `HTTP:${res.status}: ${res.statusText}\n\n${JSON.stringify(apiResponse)}`,
            date: new Date()
        };
        return report;
    }

    async modifyState(update: DeviceUpdate, devid: string): Promise<ActionResult> {
        const action = `${this.uris.lights}/${devid}/state`;
        console.log('[Hue API]', 'PUT', action, JSON.stringify(update));
        const res = await fetch(action, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(update) // body data type must match "Content-Type" header
        });
        const apiResponse: HueErrors | HueSuccess = await res.json()
        const report: ActionResult = {
            result: `HTTP:${res.status}: ${res.statusText}\n\n${JSON.stringify(apiResponse)}`,
            date: new Date()
        };
        return report;
    }

    async scenesByDevice(devid: string): Promise<Scenes> {
        console.log('[Hue API]', 'GET', this.uris.scenes);
        const res = await fetch(this.uris.scenes);
        if (!res.ok) {
            console.error(res.status, res.statusText);
        }
        const scenes: Scenes = await res.json();
        let out: Scenes = {}
        let sceneSet = [...new Set(Object.entries(scenes))];
        for (let [key, value] of sceneSet.filter(([x, y]) => y.type !== 'LightScene')) {
            let scene = <Scene>value;
            if (scene.lights.includes(devid)) {
                out[key] = value;
            }
        }
        return out;
    }

    async power(devid: string, on: boolean): Promise<ActionResult> {
        const payload: DeviceUpdate = {
            on: on,
        }
        return await this.modifyState(payload, devid);
    }
}