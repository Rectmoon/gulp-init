const path = require('path')
const server = require('./server')
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  dev: {
    stylus: resolve('src/styles/*.styl'),
    sass: resolve('src/styles/*.{scss,sass,css}'),
    less: resolve('src/styles/*.less'),
    js: resolve('src/scripts/**/*.js')
  },
  server,
  preFetchs: [
    '<meta http-equiv="x-dns-prefetch-control" content="on" />',
    '<link rel="dns-prefetch" href="//a.com">',
    '<link rel="dns-prefetch" href="//b.com">'
  ],
  libStyles: [
    '<link rel="stylesheet" href="css/reset.css" />',
    '<link rel="stylesheet" href="css/common.css" />',
    '<link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" />'
  ],
  libScripts: [
    '<script src="https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js"></script>',
    '<script src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>'
  ]
}
