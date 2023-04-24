export async function lazyComponent(module: Promise<any>) {
    const mod = await module;
    return {
        Component: mod.default as (...args: any) => JSX.Element,
    };
}
