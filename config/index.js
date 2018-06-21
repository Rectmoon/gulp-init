const path = require('path')
const server = require('./server')
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
      less: resolve('src/lib/styles/*.less')
    },
    scripts: resolve('src/js/**/*.js'),
    images: resolve('src/lib/images/**/*.{png,jpg,jpeg,gif,svg}')
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
  useBrowserify: true,
  useEslint: true,
  useWebpack: false,
  server,
  preFetchs: [
    '<meta http-equiv="x-dns-prefetch-control" content="on" />',
    '<link rel="dns-prefetch" href="//a.com">',
    '<link rel="dns-prefetch" href="//b.com">'
  ],
  libStyles: [
    '<link rel="stylesheet" href="css/reset.css" />',
    '<link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">'
  ],
  libScripts: [
    '<script src="https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js"></script>',
    '<script src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>'
  ]
}
