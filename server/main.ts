import {
    listenAndServe,
    Response,
    ServerRequest,
} from "std/http";

import * as path from "std/path";
import { contentType, EXT_MAP } from "types/mime";
import { loadConfig, GlobalConfig } from "app/config";
import { HueAPI } from 'phillips/hue';

const encoder = new TextEncoder();

function errorResponse(e: Error): Promise<Response> {
    if (e instanceof URIError) {
        return Promise.resolve({
            status: 400,
            body: encoder.encode("Bad Request"),
        });
    } else if (e instanceof Deno.errors.NotFound) {
        return Promise.resolve({
            status: 404,
            body: encoder.encode("Not Found"),
        });
    } else {
        return Promise.resolve({
            status: 500,
            body: encoder.encode("Internal server error"),
        });
    }
}

export async function serveFile(
    req: ServerRequest,
    filePath: string,
): Promise<Response> {

    const [file, fileInfo] = await Promise.all([
        Deno.open(filePath),
        Deno.stat(filePath),
    ]);
    const headers = new Headers();
    headers.set("content-length", fileInfo.size.toString());
    const contentTypeValue = contentType(filePath);
    if (contentTypeValue) {
        headers.set("content-type", contentTypeValue);
    }
    req.done.then(() => {
        file.close();
    });
    return {
        status: 200,
        body: file,
        headers,
    };
}

export async function serveModule(
    req: ServerRequest,
    filePath: string,
): Promise<Response> {

    const [file, fileInfo] = await Promise.all([
        Deno.open(filePath),
        Deno.stat(filePath),
    ]);
    const headers = new Headers();
    headers.set("Content-Length", fileInfo.size.toString());
    headers.set("content-type", EXT_MAP['.js']);
    req.done.then(() => {
        file.close();
    });
    return {
        status: 200,
        body: file,
        headers,
    };
}

export function redirect(

    path: string,
): Response {

    const headers = new Headers();
    headers.set("Location", path);

    return {
        status: 301,
        body: '',
        headers,
    };
}

export function jsonResponse(
    json: string,
): Response {
    const headers = new Headers();
    const dataSize = (new TextEncoder().encode(json)).length;
    headers.set("Content-Length", dataSize.toString());
    headers.set("Content-Type", 'application/json');
    return {
        status: 200,
        body: json,
        headers,
    };
}


const routes: { [key: string]: string } = {
    '/control': 'index.html'
};


async function routeRequest(req: ServerRequest): Promise<Response> {
    const hue = new HueAPI();
    const htmlRoot = GlobalConfig.pageRoot;
    const query: { [key: string]: string } = {}
    let url: string;
    if (req.url.match('[?]')) {
        const fullquery = req.url.split('?');
        const kvs = fullquery[1].split('&');
        for (const pair of kvs) {
            const kv = pair.split('=');
            query[kv[0].toString()] = kv[1].toString();
        }
        url = fullquery[0];
    }
    else url = req.url;

    console.debug("Request:", url);

    try {
        if (!url.endsWith('index.js') && url.startsWith('/frontend/scripts')) {
            const file = url.concat('.js');
            console.info("Serving module", file);
            return await serveModule(req, path.resolve(path.join(htmlRoot, file)));
        }
        switch (url) {
            case '/api/queryDevices': {
                return jsonResponse(JSON.stringify(await hue.lights()));
            }
            case '/api/switch': {
                const result = await hue.power(query['hueid'] ?? '', query['state'] == '1' ? true : false);
                return jsonResponse(JSON.stringify(result));
            }
            case '/api/queryGroups': {
                const out = await hue.groups()
                return jsonResponse(JSON.stringify(out));
            }
            case '/api/setGlobalScene': {
                const scene = query['scene'] ?? '';
                const out = await hue.modifyGroup(0, { scene: scene });
                return jsonResponse(JSON.stringify(out));
            }
            case '/api/queryScenes': {
                const hid = query['hueid'] ?? '';
                const out = await hue.scenesByDevice(hid);
                return jsonResponse(JSON.stringify(out));
            }
            case '/': {
                return redirect('/control');
            }
            default: {
                const file = (Object.prototype.hasOwnProperty.call(routes, url)) ? routes[url] : url;
                const filePath = path.resolve(path.join(htmlRoot, file));
                console.info("Serving", filePath);
                return await serveFile(req, filePath);
            }
        }
    }
    catch (e) {
        return await errorResponse(e)
    }
}

const hostAddress = () => `${GlobalConfig.host}:${GlobalConfig.port}`
const hostURI = () => 'http://' + hostAddress()

const reqHandler = async (req: ServerRequest) => {
    req.respond(await routeRequest(req))
};


async function main() {
    loadConfig();
    const srvAddr = hostAddress();
    const serverPromise = listenAndServe(srvAddr, reqHandler);
    //  const clientPromise = runApp(GlobalConfig.port); // For now.
    console.log(`Server listening on ${hostURI()}`);
    await Promise.all([serverPromise]);
}

if (import.meta.main) {
    (async () => await main())();
}
