export function deep_copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}