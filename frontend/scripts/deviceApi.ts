import { HueLights } from "hue.model";

export async function queryDevices(): Promise<HueLights> {
    const res = await fetch('/api/queryDevices');
    return await res.json();
}