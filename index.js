const webpackSources = require('webpack-sources')
const { findHtmlHeadEnd, findHtmlBodyEnd } = require('html-parse-utils')

class HTMLAssetsInjectionPlugin {
  constructor (config = {}) {
    this.config = Object.assign(
      {
        pagePattern: /\.html$/,
        scriptPattern: /\.js$/,
        stylesheetPattern: /\.css$/,
        scriptInjectCode: href => `<script src="${href}"></script>`,
        stylesheetInjectCode: href => `<link rel="stylesheet" href="${href}">`
      },
      config
    )
  }

  apply (compiler) {
    compiler.hooks.emit.tap('HTMLAssetsInjectionPlugin', compilation => {
      for (const chunk of compilation.chunks) {
        // List of the assets related to the chunk.
        const chunkAssets = []
        // Extracted from the chunk's registered modules' assets...
        for (const wModule of chunk.modulesIterable) {
          if (wModule.buildInfo.assets) {
            for (const assetName in wModule.buildInfo.assets) {
              if (!chunkAssets.includes(assetName)) {
                chunkAssets.push(assetName)
              }
            }
          }
        }
        // ...and the chunk's files.
        for (const assetName of chunk.files) {
          if (!chunkAssets.includes(assetName)) {
            chunkAssets.push(assetName)
          }
        }

        const publicPath = compiler.options.output.publicPath

        const scriptsInjectCode = chunkAssets
          .filter(assetName => {
            return this.config.scriptPattern.test(assetName)
          })
          .reduce((accumulator, assetName) => {
            const assetHref = publicPath + assetName

            return accumulator + this.config.scriptInjectCode(assetHref)
          }, '')

        const stylesheetsInjectCode = chunkAssets
          .filter(assetName => {
            return this.config.stylesheetPattern.test(assetName)
          })
          .reduce((accumulator, assetName) => {
            const assetHref = publicPath + assetName

            return accumulator + this.config.stylesheetInjectCode(assetHref)
          }, '')

        const chunkPages = chunkAssets.filter(assetName => {
          return this.config.pagePattern.test(assetName)
        })

        // Injects the generated HTML code at the end of the head tag for
        // stylesheets and at the and of the body tag for scripts.
        for (const pageName of chunkPages) {
          if (compilation.assets[pageName]) {
            const originalPage = compilation.assets[pageName]
              .source()
              .toString()
            const headEndPos = findHtmlHeadEnd(originalPage)
            const bodyEndPos = findHtmlBodyEnd(originalPage)
            const page =
              originalPage.slice(0, headEndPos) +
              stylesheetsInjectCode +
              originalPage.slice(headEndPos, bodyEndPos) +
              scriptsInjectCode +
              originalPage.slice(bodyEndPos)

            compilation.assets[pageName] = new webpackSources.RawSource(page)
          }
        }
      }
    })
  }
}

module.exports = HTMLAssetsInjectionPlugin
