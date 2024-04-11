# StyleX for Expo Web (Experimental)

StyleX & React Strict DOM integration with Expo for Web.

_Not intended for production for now._

This repository demonstrates how to integrate StyleX / React Strict DOM for
Expo, with support for **Static CSS Extraction** in Expo Web.

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
