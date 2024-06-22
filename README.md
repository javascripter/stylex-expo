# StyleX for Expo Web (Experimental)

StyleX & React Strict DOM integration with Expo for Web.

_Not intended for production for now._

This repository demonstrates how to integrate StyleX / React Strict DOM for
Expo, with support for **Static CSS Extraction** in Expo Web.

The official react-strict-dom repository app does not support extracting css files and injects CSS in runtime, which this repository tries to fix.
Please see [this issue](https://github.com/facebook/react-strict-dom/issues/34) for more context.

## What works?

- Production CSS extraction
- Dev mode Fast Refresh
- iOS & Android (does nothing)

## How to run
`yarn install`, then:

- web:
  - `yarn web` for developing web with Fast Refresh
  - `yarn expo export -p web` for production builds with static css file in
    dist.
- native: `yarn ios` or `yarn android`.

You can also use `yarn start` to develop for multiple platforms simultaneously.

## How does it work?

`withStyleX` Metro Plugin in configured in `metro.config.js`.

You can see the source code for `withStyleX` plugin in `stylex-metro-config`
directory.

Basic explanation:

1. Each JS file containing stylex imports is transformed using `@stylexjs/babel-plugin` in
   `stylex-metro-config/transformer.js` and stylex metadata for each file is
   directly injected in each file with `import
'stylex.virtual.css?filename=...&contents=...'`, where stylex rules and filename
   are encoded in search params.

2. Then, the resolver in `stylex-metro-config/index.js` will look for these imports
   and store these stylex rules.
3. The resulting css is written to `node_modules/.cache/stylex-metro-config/stylex.bundle.css`,
   while resolving all `stylex.virtual.css?` virtual module imports to this file.

There are a few limitations/questions I'm aware of:
- CSS files are written many times in the resolver
  - Maybe we can debounce in dev, but in production we may need to resolve synchronously?
  - Or, maybe this should be done in the serializer? I'm not too sure either.
  - In dev, is it better/faster to use the original babel plugin runtime injection in web rather than writing to .css?
- No bare RN support
  - CSS support is implemented in the Expo framework only
  - Not sure if this works without Expo Router
- Not sure if this works with bundle-splitting and static/server-rendering (haven't investigated yet).

## Monorepo usage

Follow Expo's guide on monorepos [here](https://docs.expo.dev/guides/monorepos/).

Make sure you pass the `projectRoot` to `withStylex`. Here's a working metro config:

```ts
import { getDefaultConfig } from "expo/metro-config";
import { withStyleX } from "stylex-metro-config";
import path from "path";

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver!.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = withStyleX(config, {
  projectRoot, // important
});
```
