import rimraf from 'rimraf'
import test from 'ava'
import webpack from 'webpack'
import HTMLAssetsInjectionPlugin from '../'
import fs from 'fs'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const extractCSS = new ExtractTextPlugin({
  filename: 'css/[name].css',
  allChunks: true
})

const webpackConfig = {
  target: 'web',
  mode: 'production',
  entry: {
    app: [
      './test/fixtures/index1.html',
      './test/fixtures/a1.js',
      './test/fixtures/a1.css'
    ],
    app2: [
      './test/fixtures/index2.html',
      './test/fixtures/a2.js',
      './test/fixtures/a2.css'
    ]
  },
  output: {
    path: __dirname + '/tmp',
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
    new HTMLAssetsInjectionPlugin()
  ]
}

test.always.afterEach('clear tmp', t => {
  rimraf.sync('test/tmp')
})

const files = [
  'index1.html',
  'index2.html',
  'b1.html',
  'b2.html'
]

test.serial.cb('it should inject correct files', t => {
  webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
      t.fail(err || stats.compilation.errors)
    }
    for (const file of files) {
      t.is(
        fs.readFileSync(`test/tmp/${file}`, 'utf8'),
        fs.readFileSync(`test/fixtures/expected/${file}`, 'utf8')
      )
    }
    t.end()
  })
})
