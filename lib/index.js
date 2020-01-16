const webpackSources = require('webpack-sources')
const { findHtmlHeadEnd, findHtmlBodyEnd } = require('html-parse-utils')

class HTMLAssetsInjectionPlugin {
  constructor (options = {}) {
    this.options = Object.assign(
      {
        pagePattern: /\.html$/,
        scriptPattern: /\.js$/,
        stylesheetPattern: /\.css$/,
        scriptInjectCode: href => `<script src="${href}"></script>`,
        stylesheetInjectCode: href => `<link rel="stylesheet" href="${href}">`
      },
      options
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
            for (const assetName of Object.getOwnPropertyNames(wModule.buildInfo.assets)) {
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
            return this.options.scriptPattern.test(assetName)
          })
          .reduce((accumulator, assetName) => {
            const assetHref = publicPath + assetName

            return accumulator + this.options.scriptInjectCode(assetHref)
          }, '')

        const stylesheetsInjectCode = chunkAssets
          .filter(assetName => {
            return this.options.stylesheetPattern.test(assetName)
          })
          .reduce((accumulator, assetName) => {
            const assetHref = publicPath + assetName

            return accumulator + this.options.stylesheetInjectCode(assetHref)
          }, '')

        const chunkPages = chunkAssets.filter(assetName => {
          return this.options.pagePattern.test(assetName)
        })

        // Injects the generated HTML code at the end of the head tag for
        // stylesheets and at the end of the body tag for scripts.
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
