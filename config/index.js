const path = require('path')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  dev: {
    styles: resolve('src/lib/styles/*.styl'),
    scripts: resolve('src/lib/js/**/*.js')
  },
  build: {
    styles: resolve('dist/css'),
    scripts: resolve('dist/js')
  },
  useWebpack: true
}
