import type { UserProvidedConfigProps } from "#types/config";

import { ValidationSchema } from "fastest-validator";

import { validator } from "./validator";

validator.alias("optionalString", {
	singleLine: true,
	optional: true,
	type: "string",
	empty: false,
});

export const configFileSchema: ValidationSchema<UserProvidedConfigProps> = {
	entryFilePath: { type: "string", empty: false, singleLine: true },
	esbuildConfig: { type: "record", optional: true },

	preloadSourceMapFilePath: "optionalString",
	buildRendererOutputPath: "optionalString",
	rendererTSconfigPath: "optionalString",
	buildMainOutputPath: "optionalString",
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
