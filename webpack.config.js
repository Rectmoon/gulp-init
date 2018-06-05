const webpack = require('webpack')
const path = require('path')
var SplitChunksPlugin = require('webpack/lib/optimize/SplitChunksPlugin')

module.exports = {
  mode: 'production',
  entry: {
    index: './src/lib/js/index.js',
    main: './src/lib/js/main.js'
  },
  output: {
    path: path.resolve(__dirname, '/dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  plugins: [
    //new webpack.optimize.UglifyJsPlugin({
    //  compress: {
    //    warnings: false,
    //  },
    //  output: {
    //    comments: false,
    //  },
    //}),//压缩和丑化

    new webpack.ProvidePlugin({
      $: 'jquery'
    }), //直接定义第三方库
    new webpack.optimize.SplitChunksPlugin({
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true
    })
  ]
}
