const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = initWebpack

function initWebpack(env, argv) {
  const isProduction = argv.mode === 'production'
  const htmlMinifyOptions = {
    removeComments: isProduction,
    collapseWhitespace: isProduction,
    removeRedundantAttributes: isProduction,
    useShortDoctype: isProduction,
    removeEmptyAttributes: isProduction,
    removeStyleLinkTypeAttributes: isProduction,
    keepClosingSlash: isProduction,
    minifyJS: isProduction,
    minifyCSS: isProduction,
    minifyURLs: isProduction
  }
  const imgLoaderOptions = {
    disable: !isProduction,
    mozjpeg: {
      progressive: true,
      quality: 65
    },
    optipng: {
      enabled: true
    },
    pngquant: {
      quality: '65-90',
      speed: 4
    },
    gifsicle: {
      interlaced: false
    }
  }
  return {
    entry: ['./src/scripts/index.js'],
    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: '/',
      filename: 'assets/js/bundle.js'
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.jsx?$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: isProduction,
                  compact: isProduction
                }
              }
            },
            {
              test: [/\.scss$/, /\.css$/],
              exclude: /node_modules/,
              use: [
                isProduction
                  ? {
                      loader: MiniCssExtractPlugin.loader,
                      options: {
                        publicPath: '../../'
                      }
                    }
                  : 'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 2,
                    minimize: isProduction,
                    sourceMap: true
                  }
                },
                'postcss-loader',
                'sass-loader'
              ]
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    limit: 10000,
                    name: 'assets/media/[name].[ext]'
                  }
                },
                {
                  loader: 'image-webpack-loader',
                  options: imgLoaderOptions
                }
              ]
            },
            {
              test: /\.svg$/,
              loader: 'svg-sprite-loader',
              options: {
                extract: true,
                spriteFilename: 'assets/media/sprite.svg'
              }
            },
            {
              exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
              loader: 'file-loader',
              options: {
                name: 'assets/media/[name].[ext]'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
        minify: htmlMinifyOptions
      }),
      // This won't work without `svg-sprite-loader` in `loaders`.
      new SpriteLoaderPlugin({
        plainSprite: true
      }),
      // This won't work without `MiniCssExtractPlugin.loader` in `loaders`.
      new MiniCssExtractPlugin({
        filename: 'assets/styles/styles.css'
      })
    ],
    resolve: {
      modules: [path.resolve(__dirname, 'src'), './node_modules']
    },
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      historyApiFallback: true,
      compress: true,
      // Enable Hot Reloading server.
      // hot: true,
      // Enable HTTPS.
      // https: true,
      // In console You usually want to see only warnings and errors with its details.
      stats: {
        all: false,
        warnings: true,
        errors: true,
        errorDetails: true
      }
    }
  }
}
