const worker = require("metro-transform-worker")
const { transformSync } = require("@babel/core")
const styleXBabelPlugin = require("@stylexjs/babel-plugin")
const path = require("path")

function toStyleXVirtualModuleName({ filename, stylexRules }) {
  const contents = JSON.stringify(stylexRules)
  return `stylex.virtual.css?${new URLSearchParams({
    filename,
    contents,
  })}`
}

function transformWithStyleXBabelPlugin(filename, sourceCode, styleXOptions) {
  const { code, map, metadata } = transformSync(sourceCode, {
    babelrc: false,
    sourceFileName: filename,
    filename,
    parserOpts: {
      plugins: /\.tsx?$/.test(filename)
        ? ["typescript", "jsx"]
        : // TODO: add flow
          ["jsx"],
    },
    plugins: [styleXBabelPlugin.withOptions(styleXOptions)],
  })
  return { code, map, metadata }
}

async function transform(config, projectRoot, filename, data, options) {
  const upstreamTransform = config.transformerPath
    ? require(config.transformerPath).transform
    : worker.transform

  const platform = options.platform
  const styleXOptions = config.styleXOptions
  const importSources = styleXOptions.importSources ?? []

  // On native, RSD is runtime-only and doesn't need to be transformed.
  // On web, run the transform only for module (not assets).
  if (platform !== "web" || options.type !== "module") {
    return upstreamTransform(config, projectRoot, filename, data, options)
  }

  const styleXImports = importSources.map((source) => {
    if (typeof source === "string") {
      return source
    }
    return source.from
  })

  const sourceCode = data.toString("utf8")

  // Skip files that don't have any stylex imports
  if (
    !styleXImports.some((importSource) => sourceCode.includes(importSource))
  ) {
    return upstreamTransform(config, projectRoot, filename, data, options)
  }

  const {
    code: transformedCode,
    map,
    metadata,
  } = transformWithStyleXBabelPlugin(filename, sourceCode, styleXOptions)

  const hasNoStyleXRules =
    !metadata || !("stylex" in metadata) || metadata.stylex == null

  if (hasNoStyleXRules) {
    // Skip virtual module injection and return transformed code
    return upstreamTransform(
      config,
      projectRoot,
      filename,
      transformedCode,
      options
    )
  }

  const virtualModuleName = toStyleXVirtualModuleName({
    filename,
    stylexRules: metadata.stylex,
  })

  const codeWithVirtualModule = `${transformedCode}\nimport ${JSON.stringify(
    virtualModuleName
  )}`

  return upstreamTransform(
    config,
    projectRoot,
    filename,
    codeWithVirtualModule,
    options
  )
}

module.exports.transform = transform
