export function page(opts?: { cors: boolean }) {
    const headers = new Headers();
    headers.set("content-type", "text/html");
    headers.append("access-control-allow-origin", "*");
    headers.append(
        "access-control-allow-headers",
        "Origin, X-Requested-With, Content-Type, Accept, Range",
    );
}