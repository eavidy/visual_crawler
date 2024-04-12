import { useEffect } from "react";

export class GlobalHook<T> {
  #hookName: string;
  constructor(hookName = "useGlobalHook") {
    this.#hookName = hookName;
  }
  hook?: T;
  useGlobalHook = (hookRes: T) => {
    this.hook = hookRes;
    useEffect(() => this.#unmount, []);
    return hookRes;
  };
  #unmount = () => {
    this.hook = undefined;
  };
  get(attr?: keyof T) {
    if (this.hook) {
      if (!attr) return this.hook;
      return this.hook[attr];
    } else {
      throw new Error(this.#hookName + " 必须添加到组件中");
    }
  }
}
