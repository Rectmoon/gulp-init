module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-cssnext': {
      warnForDuplicates: false
    },
    autoprefixer: {
      browsers: ['> 1%', 'last 6 versions', 'not ie <= 8']
    },
    'css-mqpacker': {},
    'postcss-opacity': {}
  }
}
