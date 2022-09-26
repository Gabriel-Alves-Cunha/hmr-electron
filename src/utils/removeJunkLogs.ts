import { TransformOptions } from "node:stream";

export const removeJunkTransformOptions: TransformOptions = {
	decodeStrings: false,

	transform(chunk, _encoding, doneCb) {
		const source = chunk.toString();

		if (junkRegex_1.test(source)) return false;
		if (junkRegex_2.test(source)) return false;
		if (junkRegex_3.test(source)) return false;

		doneCb(null, chunk);

		return;
	},
};

/** Example: 2018-08-10 22:48:42.866 Electron[90311:4883863] *** WARNING: Textured window <AtomNSWindow: 0x7fb75f68a770> */
const junkRegex_1 =
	/\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/;

/** Example: [90789:0810/225804.894349:ERROR:CONSOLE(105)] "Uncaught (in promise) Error: Could not instantiate: ProductRegistryImpl.Registry", source: chrome-devtools://devtools/bundled/inspector.js (105) */
const junkRegex_2 = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/;

/** Example: ALSA lib confmisc.c:767:(parse_card) cannot find card '0' */
const junkRegex_3 = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/;
