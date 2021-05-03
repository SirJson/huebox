import { queryDevices } from "./deviceApi";
import { colorVars } from "./colors";
import { Scenes, Scene } from "hue.model";

function loadStyle(path: string): HTMLLinkElement {
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', path);
    return linkElem;
}

interface InnerHTML {
    title: HTMLHeadingElement,
    toggleBnt: HTMLButtonElement,
    scenesLabel: HTMLLabelElement,
    scenesSelect: HTMLSelectElement
}

export interface SceneChangeData {
    name: string
}

export class DeviceControl extends HTMLElement {
    static get observedAttributes() {
        return ['on', 'state', 'devid'];
    }


    inner: InnerHTML;
    container: HTMLElement;
    onstate: boolean = false;
    name: string = ''
    devid: string = ''

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });


        this.container = document.createElement('div');
        this.container.classList.add('device');
        this.inner = {
            title: document.createElement('h3'),
            toggleBnt: document.createElement('button'),
            scenesLabel: document.createElement('label'),
            scenesSelect: document.createElement('select'),

        };

        this.updateState();

        this.inner.scenesLabel.innerText = "Scenes";
        this.inner.scenesSelect.id = 'scenes';
        this.inner.scenesLabel.setAttribute('for', 'scenes');

        this.inner.toggleBnt.innerText = "Toggle";


        this.inner.toggleBnt.addEventListener('click', async () => {
            this.onToggle();
        });

        this.inner.scenesSelect.addEventListener('change', async (event) => {
            if (event.isTrusted) {
                const newScn = this.inner.scenesSelect.value;
                this.globalScene(newScn);
                let evt = new CustomEvent<SceneChangeData>("globalDeviceChange", { detail: { name: newScn } });
                window.dispatchEvent(evt);
            }
        })
        const titleContainer = document.createElement('header');
        const icon = document.createElement('span');
        icon.classList.add('gg-smart-home-light');
        titleContainer.appendChild(icon);
        titleContainer.appendChild(this.inner.title);


        this.container.appendChild(titleContainer);


        for (let e of Object.entries(this.inner)) {
            const k = e[0];
            const v = e[1];
            if (k == 'title') { continue };
            console.debug(k);
            this.container.appendChild(v);
        }

        shadow.appendChild(loadStyle('styles/elements/device.css'));
        shadow.appendChild(this.container);

    }

    async onToggle() {
        this.onstate = !this.onstate;
        console.debug('toggle', this.onstate, !this.onstate);
        await this.power(this.devid, this.onstate);
        this._viewUpdate();
    }

    _viewUpdate() {
        if (this.onstate) {
            this.inner.toggleBnt.classList.add('success');
            this.inner.toggleBnt.classList.remove('danger');
        }
        else {
            this.inner.toggleBnt.classList.remove('success');
            this.inner.toggleBnt.classList.add('danger');
        }
        this.name = this.getAttribute('name') ?? '???';
        this.devid = this.getAttribute('deviceid') ?? '0';
        this.inner.scenesSelect.value = this.getAttribute('scene') ?? 'None';
        this.inner.title.innerText = this.name;
    }


    updateState() {
        this.onstate = this.getAttribute('state') == "true" ? true : false;
        this._viewUpdate();
    }

    async globalScene(sceneKey: string) {
        console.debug("Switching global scene", sceneKey);
        const res = await fetch(`/api/setGlobalScene?scene=${sceneKey}`);
        const data = await res.json();
        return data;
    }

    async power(dev: string, state: boolean) {
        let snum = state ? 1 : 0;
        const res = await fetch(`/api/switch?state=${snum}&hueid=` + dev);
        const data = await res.json();
        return data;
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        console.log('changed', name, oldValue, newValue);
        this.updateState();
    }

    addOption(selectElement: HTMLSelectElement, name: string, value: string) {
        const opt = document.createElement('option');
        opt.innerText = name;
        opt.value = value;
        selectElement.appendChild(opt);
    }

    viewSetScene(key: string) {
        this.inner.scenesSelect.value = key;
    }

    async loadScenes() {
        const res = await fetch(`/api/queryScenes?hueid=${this.devid}`);
        const data: Scenes = await res.json();
        for (let [key, value] of Object.entries(data)) {
            this.addOption(this.inner.scenesSelect, value.name, key);
        }
    }
}
