export function delay(secs: number) {
  return new Promise(resolve => { window.setTimeout(() => { resolve(true); }, secs * 1000) })
}
