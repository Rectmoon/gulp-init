const path = require('path')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  dev: {
    styles: resolve('src/lib/styles/*.styl')
  },
  build: {
    styles: resolve('dist/lib/css')
  }
}
