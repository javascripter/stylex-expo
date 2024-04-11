const fs = require("fs")
const path = require("path")
const styleXBabelPlugin = require("@stylexjs/babel-plugin")

function isStyleXVirtualModuleName(moduleName) {
  return moduleName.startsWith("stylex.virtual.css?")
}

function fromStyleXVirtualModuleName(moduleName) {
  const { filename, contents } = Object.fromEntries(
    new URLSearchParams(moduleName.replace("stylex.virtual.css?", ""))
  )

  const styleXRules = JSON.parse(contents)

  return { filename, styleXRules }
}

function createVirtualModuleResolver(bundleFilePath) {
  const styleXRulesMap = new Map()

  function reset() {
    fs.mkdirSync(path.dirname(bundleFilePath), { recursive: true })
    fs.writeFileSync(bundleFilePath, "", "utf-8")
  }

  function update() {
    const stylexCSS = styleXBabelPlugin.processStylexRules(
      [...styleXRulesMap.values()].flat(),
      true
    )

    fs.mkdirSync(path.dirname(bundleFilePath), { recursive: true })
    fs.writeFileSync(bundleFilePath, stylexCSS, "utf-8")
  }

  function resolveRequest(context, moduleName, platform) {
    if (!isStyleXVirtualModuleName(moduleName)) {
      return context.resolveRequest(context, moduleName, platform)
    }

    const { filename, styleXRules } = fromStyleXVirtualModuleName(moduleName)

    styleXRulesMap.set(filename, styleXRules)

    update()

    return {
      type: "sourceFile",
      filePath: bundleFilePath,
    }
  }

  return {
    reset,
    resolveRequest,
  }
}

function withStyleX(metroConfig, options = {}) {
  const isDev = process.env.NODE_ENV === "development"

  const projectRoot = options.projectRoot ?? process.cwd()

  const styleXOptions = {
    ...options.styleXOptions,
    dev: isDev,
    importSources: [
      "@stylexjs/stylex",
      { from: "react-strict-dom", as: "css" },
    ],
    runtimeInjection: false,
    styleResolution: "property-specificity",
    unstable_moduleResolution: {
      rootDir: projectRoot,
      type: "commonJS",
    },
  }

  const defaultStyleXBundleFilePath = path.resolve(
    projectRoot,
    "node_modules/.cache/stylex-metro-config/stylex.bundle.css"
  )

  const bundleFilePath = options.bundleFilePath ?? defaultStyleXBundleFilePath

  const { reset, resolveRequest } = createVirtualModuleResolver(bundleFilePath)

  reset()

  return {
    ...metroConfig,
    resolver: {
      ...metroConfig.resolver,
      resolveRequest,
    },
    transformerPath: require.resolve("./transformer"),
    transformer: {
      ...metroConfig.transformer,
      transformerPath: metroConfig.transformerPath,
      styleXOptions,
    },
  }
}

module.exports.withStyleX = withStyleX
