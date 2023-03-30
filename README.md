# hmr-electron

__hmr-electron__ is a package to ease the development of an app with *__Electron + Vite__* by enabling transparent module reloading.

This project is based on [elecrun](https://github.com/jctaoo/elecrun). I was bored and liked it.

## Installation

Use your preferred package manager to install:

``` sh
yarn add --dev hmr-electron
```

## Usage

You need to have a file on the root of your package named __*__hmr-electron.config.ts__*__
Type in your terminal `yarn hmr-electron init` and this file will be created:

``` ts
import type { UserProvidedConfigProps } from "hmr-electron";

const config: UserProvidedConfigProps = {
 electronEntryFilePath: "./src/main/index.cts",
 preloadFilePath: "./src/main/preload.cts",
};

export default config;
```

There are several other config options that you can set. Check the type `UserProvidedConfigProps` to see them.

Set scripts on your __*__package.json__*__

``` json
{
 "scripts": {
  "build": "hmr-electron build",
  "clean": "hmr-electron clean",
  "dev": "hmr-electron dev"
 },
 "devDependencies": {
  "hmr-electron": "latest",
  "@types/node": "latest",
  "typescript": "latest",
  "electron": "latest",
  "vite": "latest"
 }
}
```

## Contributing

Once you've cloned the repo, make use of the demo package inside '/tests/full/demo' by linking to main package:

``` sh
# On this repo:
yarn link # `unlink` to unlink.

# On /tests/full/demo
yarn link "hmr-electron"`
```

This will create a symlink named *__demo/node_modules/hmr-electron__* that links to your local copy of the *__hmr-electron__* project.

This way, you'll only need to do a `yarn build` on every change that you make and run the demo project, as it will use the newest build.

> You can also contribute by creating tests 😃. This project uses [vitest](https://vitest.dev/), so it's a fast developer experience 💙💙! Just run `yarn test`.

## License

[MIT](https://choosealicense.com/licenses/mit/)
