import type { ConfigProps } from "#types/config";

import { ValidationSchema } from "fastest-validator";

import { validator } from "./validator";

validator.alias("optionalString", {
	singleLine: true,
	type: "string",
	optional: true,
	empty: false,
});

export const configFileSchema: ValidationSchema<ConfigProps> = {
	entryFilePath: { type: "string", empty: false, singleLine: true },
	esbuildConfig: { type: "record", optional: true },

	buildRendererOutputPath: "optionalString",
	rendererTSconfigPath: "optionalString",
	buildMainOutputPath: "optionalString",
	preloadMapFilePath: "optionalString",
	mainTSconfigPath: "optionalString",
	baseTSconfigPath: "optionalString",
	nodeModulesPath: "optionalString",
	packageJsonPath: "optionalString",
	buildOutputPath: "optionalString",
	viteConfigPath: "optionalString",
	devOutputPath: "optionalString",
	rendererPath: "optionalString",
	mainPath: "optionalString",
	srcPath: "optionalString",
	cwd: "optionalString",

	$$strict: true, // No additional properties allowed
};
