import { useEffect } from "react";

export class GlobalHook<T> {
    hook?: T;
    useGlobalHook = (hookRes: T) => {
        this.hook = hookRes;
        useEffect(() => this.#unmount, []);
    };
    #unmount = () => {
        this.hook = undefined;
    };
}
