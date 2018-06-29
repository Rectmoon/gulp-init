const fs = require('fs')
const path = require('path')
const through = require('through2')
const gulp = require('gulp')
const gutil = require('gulp-util')
const config = require('../config')
const iconv = require('iconv-lite')

//项目目录
let pName = ''
module.exports = initTplFile

function initTplFile(base, projName) {
  pName = projName
  return through.obj((chunk, enc, cb) => {
    if (chunk.isNull()) {
      return cb(null, chunk)
    }

    if (chunk.isStream()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'))
      return cb()
    }
    let fileContents = fs.readFileSync(chunk.path)
    fileContents = iconv.decode(fileContents, 'utf8')
    let _base = base || chunk.base
    if (chunk.path.match(/\.s?htm*/)) {
      //把html的文件名提取出来
      let fileName = path.basename(chunk.path)
      fileName = fileName.substr(0, fileName.indexOf('.'))
      //把style标签里面的内容放到css文件里面去
      fileContents = indexLink(fileContents, _base, fileName)
      //插入必要的JS标签
      fileContents.indexOf(config.libScripts[0]) < 0 &&
        (fileContents = insertScript(fileContents, _base, fileName))
      // DNS Prefetch，即DNS预获取，是前端优化的一部分。
      //一般来说,在前端优化中与 DNS 有关的有两点:一个是减少DNS的请求次数,另一个就是进行DNS预获取。
      //增加DNS prefetch的代码
      fileContents.indexOf(config.preFetchs[0]) < 0 &&
        (fileContents = insertDnsPrefetch(fileContents))
    }
    chunk.contents = Buffer.from(fileContents)
    cb(null, chunk)
  })
}

//将style标签里面的内容写到css里面
function indexLink(fileContents, base, fileName) {
  /**
   *!!!!!
   *  如果没有替换成功，
   * 可能要把编辑器的files.eol设置成'\r\n'(CRLF)
   */
  return fileContents.replace(
    /<style((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>(.*?\r\n)*(\s)*<\/style>/g,
    function(a, b, c, d) {
      let _a = a
      //把style标签里面内容提取出来
      a = a
        .replace(/<style((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>/g, '')
        .replace(/<\/style>/g, '')
      //写到css文件里面
      let cssFile = path.join(base, '/css/' + fileName + '.css')
      try {
        a = iconv.encode(a, 'utf8')
        fs.writeFileSync(cssFile, a)
      } catch (e) {
        console.log('CSS文件写失败~')
        console.log('请先执行init任务~')
        // return _a
        process.exit()
      }
      return '<link rel="stylesheet" href="css/' + fileName + '.css" />\r\n'
    }
  )
}

function replaceFileContents(fileContents, index, content) {
  let arr = fileContents.split('')
  arr.splice(index, 0, content)
  return arr.join('')
}

//js链接地址
function insertScript(fileContents, base, fileName) {
  const { libStyles, libScripts } = config
  //库CSS，插到header前面
  let firstLinkIndex =
    fileContents.indexOf('<link') > 0
      ? fileContents.indexOf('<link')
      : fileContents.indexOf('</head>')
  fileContents = replaceFileContents(fileContents, firstLinkIndex, [...libStyles, ''].join('\r\n'))

  // 库JS
  let bodyIndex = fileContents.indexOf('</body>')
  fileContents = replaceFileContents(fileContents, bodyIndex, [...libScripts, ''].join('\r\n'))
  //业务JS，插入到最后
  if (fileName != 'index') {
    //拷贝一个新的js
    fs.createReadStream('./tpl/dev/scripts/index.js').pipe(
      fs.createWriteStream(`./src/scripts/${fileName}.js`)
    )
    //发到项目目录
    gulp.src(`./src/scripts/${fileName}.js`).pipe(gulp.dest(`${base}/dev/scripts/`))
  }
  let lastScript = `<script type="text/javascript" src="js/${fileName}.js"></script>\r\n `
  bodyIndex = fileContents.indexOf('</body>')
  fileContents = replaceFileContents(fileContents, bodyIndex, lastScript)
  return fileContents
}
//增加dns-prefetch代码
function insertDnsPrefetch(fileContents) {
  const { preFetchs } = config
  let prefetch = ''
  prefetch += '\r\n' + [...preFetchs].join('\r\n')
  //插到title后面
  let titleIndex = fileContents.indexOf('</title>')
  fileContents = replaceFileContents(fileContents, titleIndex + 8, prefetch)
  return fileContents
}
