import { queryDevices } from './deviceApi';
import { HueLights } from 'hue.model';
import { DeviceControl, SceneChangeData } from './devicectl';
import { palette } from './utils'

window.addEventListener('load', (async () => {
    defineElements();
    await overview();
}));

function defineElements() {
    console.debug('define elements');
    customElements.define('device-control', DeviceControl)
}


function buildDeviceControl(deviceid: string, name: string, state: boolean): DeviceControl {
    const dev = document.createElement('device-control');
    dev.setAttribute('deviceid', deviceid);
    dev.setAttribute('name', name);
    dev.setAttribute('state', state.toString());
    return <DeviceControl>dev;
}

function globalUpdate(newScene: string) {
    const root = document.querySelector('#devices') ?? null;
    if (root == null) return;
    for (let e of root.children) {
        (<DeviceControl>e).updateState();
        (<DeviceControl>e).viewSetScene(newScene);
    }
}

async function buildDeviceList() {
    console.debug('build devices');
    const devices = await queryDevices();
    const root = document.querySelector('#devices');
    for (let [key, value] of Object.entries(devices)) {
        const control = buildDeviceControl(key, value.name ?? 'Unnamed', value.state.on);
        control.loadScenes();
        root?.appendChild(control);
    }
    window.addEventListener('globalDeviceChange', (e: Event) => {
        console.log("globaldevchange");
        const cevt = <CustomEvent<SceneChangeData>>e;
        globalUpdate(cevt.detail.name);
    });
}

async function overview() {
    await buildDeviceList();
}
