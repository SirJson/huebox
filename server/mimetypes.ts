import * as path from "std/path";

export const EXT_MAP: Record<string, string> = {
    ".md": "text/markdown",
    ".html": "text/html",
    ".htm": "text/html",
    ".json": "application/json",
    ".map": "application/json",
    ".txt": "text/plain",
    ".ts": "text/typescript",
    ".tsx": "text/tsx",
    ".js": "application/javascript",
    ".jsx": "text/jsx",
    ".gz": "application/gzip",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".mjs": "application/javascript",
    ".svg": "image/svg+xml",
};

export function contentType(vpath: string): string | undefined {
    return EXT_MAP[path.extname(vpath)];
}