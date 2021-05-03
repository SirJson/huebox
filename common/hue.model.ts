

export interface HueLight {
    state: State;
    swupdate?: Swupdate;
    type?: string;
    name?: string;
    modelid?: string;
    manufacturername?: string;
    productname?: string;
    capabilities?: Capabilities;
    config?: Config;
    uniqueid?: string;
    swversion?: string;
    swconfigid?: string;
    productid?: string;
}

export interface Capabilities {
    certified?: boolean;
    control?: Control;
    streaming?: Streaming;
}

export interface Control {
    mindimlevel?: number;
    maxlumen?: number;
    ct?: CT;
    colorgamuttype?: string;
    colorgamut?: Array<number[]>;
}

export interface CT {
    min?: number;
    max?: number;
}

export interface Streaming {
    renderer?: boolean;
    proxy?: boolean;
}

export interface Config {
    archetype?: string;
    function?: string;
    direction?: string;
    startup?: Startup;
}

export interface Startup {
    mode?: string;
    configured?: boolean;
    customsettings?: Customsettings;
}

export interface Customsettings {
    bri?: number;
    ct?: number;
    xy?: number[];
}

export interface State {
    on: boolean;
    bri?: number;
    ct?: number;
    alert?: string;
    colormode?: string;
    mode?: string;
    reachable?: boolean;
    hue?: number;
    sat?: number;
    effect?: string;
    xy?: number[];
}


export interface Action {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
    effect: string;
    xy: number[];
    ct: number;
    alert: string;
    colormode: string;
}

export interface Swupdate {
    state?: string;
    lastinstall?: Date;
}

export enum SceneType {

    GroupScene = "GroupScene",
    LightScene = "LightScene",

}

export interface Appdata {
    version: number;
    data: string;
}

export interface Scene {
    name: string;
    type: SceneType;
    group?: string;
    lights: string[];
    owner: string;
    recycle: boolean;
    locked: boolean;
    appdata?: Appdata;
    picture?: string;
    image?: string;
    lastupdated: Date;
    version: number;
}

export interface DeviceUpdate {
    hue?: number;
    on?: boolean;
    bri?: number;
    sat?: number;
    xy?: number[];
    ct?: number;
    alert?: string;
    effect?: string;
    transitiontime?: number;
    bri_inc?: number;
    sat_inc?: number;
    hue_inc?: number;
    ct_inc?: number;
    xy_inc?: number[];
}

export interface GroupUpdate {
    hue?: number;
    on?: boolean;
    bri?: number;
    sat?: number;
    xy?: number[];
    ct?: number;
    alert?: string;
    effect?: string;
    transitiontime?: number;
    bri_inc?: number;
    sat_inc?: number;
    hue_inc?: number;
    ct_inc?: number;
    xy_inc?: number[];
    scene: string
}

export interface HueGroup {
    name: string;
    lights: string[];
    type: string;
    action: Action;
}


export interface HueError {
    error?: Error;
}

export interface HueOk {
    success?: Ok;
}

export interface Error {
    type?: number;
    address?: string;
    description?: string;
}

export interface Ok {
    [path: string]: any
}

export type HueLights = {
    [key: string]: HueLight
}

export type HueErrors = {
    HueError: []
}

export type HueSuccess = {
    HueOk: []
}

export type Scenes = {
    [key: string]: Scene
}

export type HueGroups = {
    [key: string]: HueGroup
}