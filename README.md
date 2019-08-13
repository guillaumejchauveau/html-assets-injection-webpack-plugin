# HTML assets injection webpack plugin

This package contains a Webpack plugin that injects stylesheets and scripts load codes in HTML pages. The assets and pages are grouped by chunk. Each assets identified by a script pattern and a stylesheet pattern are added to assets identified with a page pattern. Exemple
```js
import HTMLAssetsInjectionPlugin from 'html-assets-injection-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const extractCSS = new ExtractTextPlugin({
  filename: 'css/[name].css',
  allChunks: true
})
// A webpack config example.
{
  target: 'web',
  mode: 'production',
  entry: {
    firstChunk: [ // Will output a js/firstChunk.js file and a css/firstChunk.css file.
      './index1.html',
      './1.js',
      './1.css'
    ],
    secondChunk: [ // Will output a js/secondChunk.js file and a css/secondChunk.css file.
      './index2.html',
      './2.js',
      './2.css'
    ]
  },
  output: {
    path: __dirname + '/build',
    filename: 'js/[name].js',
    publicPath: './'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              context: __dirname,
              name: '[name].html'
            }
          },
          {
            loader: 'extract-loader',
            options: {
              publicPath: './'
            }
          },
          'html-loader'
        ]
      },
      {
        test: /\.css$/,
        use: extractCSS.extract(['css-loader'])
      },
    ]
  },
  plugins: [
    extractCSS,
    new HTMLAssetsInjectionPlugin({ // Optionnal configuration object with default values.
        pagePattern: /\.html$/,
        scriptPattern: /\.js$/,
        stylesheetPattern: /\.css$/,
        scriptInjectCode: href => `<script src="${href}"></script>`,
        stylesheetInjectCode: href => `<link rel="stylesheet" href="${href}">`
    })
  ]
}
```
Any HTML files emitted by the first chunk will have load codes injected for `js/firstChunk.js` (at the end of the body) and `css/firstChunk.css` (at the end of the head). Second chunk's files will be processed the same way.
