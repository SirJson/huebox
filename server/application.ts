import { Webview } from "sys/webview";

export async function runApp(port: string) {
  const webview = new Webview(
    { url: `http://localhost:${port}` },
  );
  return webview.run();
}
