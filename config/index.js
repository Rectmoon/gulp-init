const path = require('path')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  dev: {
    static: './lib/**/*',
    html: [resolve('src/**/*.html'), '!./src/include/**/*'],
    allhtml: resolve('src/**/*.html'),
    styles: {
      stylus: resolve('src/lib/styles/*.styl'),
      sass: resolve('src/lib/styles/*.{scss,sass,css}'),
      less: resolve('src/lib/styles/*.less'),
      css: resolve('src/lib/styles/*.css')
    },
    scripts: resolve('src/lib/js/**/*.js'),
    images: resolve('src/lib/images/**/*.{png,jpg,gif,svg}')
  },
  build: {
    static: resolve('dist/static'),
    html: resolve('dist'),
    styles: resolve('dist/css'),
    scripts: resolve('dist/js'),
    images: resolve('dist/images')
  },
  zip: {
    name: 'gulpProject.zip',
    path: resolve('dist/**/*'),
    dest: path.join(__dirname, '../')
  },
  useWebpack: true
}
