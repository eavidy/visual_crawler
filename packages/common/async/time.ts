export function waitTime(time: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
