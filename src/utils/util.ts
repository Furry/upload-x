export function padTo(input: string, max: number): string {
    if (max == 0) return input
    return input.padEnd(max, "0")
}

export function chunk(str: string, size: number): string[] {
    const res = str.match(new RegExp('.{1,' + size + '}', 'g'))
    if (!res) return []
    else return res
}

export function flipObj(obj): {[key: string]: any} {
    const ret = {};
    Object.keys(obj).forEach(key => {
      ret[obj[key]] = key;
    });
    return ret;
}

export function choice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}