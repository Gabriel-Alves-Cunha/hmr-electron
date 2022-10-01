import { TransformOptions } from "node:stream";

export const removeJunkTransformOptions: TransformOptions = {
	decodeStrings: false,

	transform(chunk: Buffer, _encoding, doneCb) {
		const source: string = chunk.toString();

		if (
			source.includes(errorThatAlwaysAppear, 49) ||
			junkRegex_1.test(source) ||
			junkRegex_2.test(source) ||
			junkRegex_3.test(source)
		)
			return;

		doneCb(undefined, chunk);
	},
};

/** Example: 2018-08-10 22:48:42.866 Electron[90311:4883863] *** WARNING: Textured window <AtomNSWindow: 0x7fb75f68a770> */
const junkRegex_1 =
	/\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+]/;

/** Example: [90789:0810/225804.894349:ERROR:CONSOLE(105)] "Uncaught (in promise) Error: Could not instantiate: ProductRegistryImpl.Registry", source: chrome-devtools://devtools/bundled/inspector.js (105) */
const junkRegex_2 = /\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/;

/** Example: ALSA lib confmisc.c:767:(parse_card) cannot find card '0' */
const junkRegex_3 = /ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/;

// libva error: vaGetDriverNameByIndex() failed with unknown libva error, driver_name = (null)
const errorThatAlwaysAppear = "unknown libva error, driver_name = (null)";
