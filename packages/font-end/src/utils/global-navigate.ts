import {
  NavigateOptions,
  To,
  useNavigate,
  NavigateFunction,
} from "react-router-dom";
import { GlobalHook } from "./global-hook.ts";

export function navigate(delta: number): void;
export function navigate(to: To, option?: NavigateOptions): void;
export function navigate(to: To | number, option?: NavigateOptions) {
  if (globalNavigate.hook) {
    return globalNavigate.hook(to as any, option);
  } else {
    throw new Error("useGlobalNavigate 必须添加到组件中");
  }
}

const globalNavigate = new GlobalHook<NavigateFunction>();

export function useGlobalNavigate() {
  globalNavigate.useGlobalHook(useNavigate());
}
