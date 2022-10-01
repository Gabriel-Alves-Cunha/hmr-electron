import { defineConfig } from "vite";

const rendererPath = "./src/renderer";
const outDirRenderer = "./build/renderer";

export default defineConfig({
	base: "./",
	root: rendererPath,
	build: { outDir: outDirRenderer, emptyOutDir: true },
});
