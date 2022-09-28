import type { BuildOptions } from "esbuild";

declare module "hmr-electron";

export declare type UserProvidedConfigProps = {
    preloadSourceMapFilePath?: string | undefined;
    preloadFilePath?: string | undefined;
    buildRendererOutputPath?: string;
    rendererTSconfigPath?: string;
    electronEntryFilePath: string;
    buildMainOutputPath?: string;
    esbuildConfig?: BuildOptions;
    baseTSconfigPath?: string;
    mainTSconfigPath?: string;
    nodeModulesPath?: string;
    packageJsonPath?: string;
    buildOutputPath?: string;
    hmrElectronPath?: string;
    viteConfigPath?: string;
    devOutputPath?: string;
    rendererPath?: string;
    mainPath?: string;
    srcPath?: string;
    cwd?: string;
};
