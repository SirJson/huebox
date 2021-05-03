export function palette(name: string) {
    return window.getComputedStyle(document.documentElement).getPropertyValue('--' + name);
}