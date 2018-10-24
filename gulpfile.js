// const config = require('./config')
const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
// const del = require('del')
const chalk = require('chalk')
const stylus = require('gulp-stylus')
const sass = require('gulp-sass')
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const eslint = require('gulp-eslint')
const browFile = require('./utils/browFile')
const initTplFile = require('./utils/initTplFile')
const rename = require('gulp-rename')

// const webpack = require('webpack')
// const webpackStream = require('webpack-stream')
// const webpackConfig = require('./webpack.config.js')

// 命令参数
let argv = process.argv
let taskParam = {}
for (let i = 0, l = argv.length; i < l; i++) {
  if (argv[i].indexOf('-') === 0) {
    if (argv[i + 1] && argv[i + 1].indexOf('-') === 0) {
      taskParam[argv[i]] = ''
    } else {
      taskParam[argv[i]] = argv[i + 1]
      i++
    }
  }
}

const tmp = 'tmp/'
//是否启动browserify
const isBrowserify = taskParam.hasOwnProperty('-b')
//是否启动webpack
const isWebpack = taskParam.hasOwnProperty('-w')
//是否启动browserSync
const useBrowserSync = taskParam.hasOwnProperty('-s')

// server
const browserSync = require('browser-sync').create()
const reload = browserSync.reload
//根目录
let baseDir = '../n/'
//监听目录
let pDir = taskParam['-d'] || taskParam['-p']
let _pDir = baseDir + pDir
let watchDir = [
  _pDir + '/js/dev.js',
  _pDir + '/styles/*.{scss,sass,css,less,styl}'
]

try {
  let stat = fs.statSync(_pDir)
} catch (e) {
  console.log('要监听的目录不存在~')
  return
}

function onErr(err) {
  const title = err.plugin + ' ' + err.name
  const msg = err.message
  const errContent = msg.replace(/\n/g, '\\A ')
  notify.onError({
    title,
    message: errContent,
    sound: true
  })(err)
  this.emit('end')
}

function t(...args) {
  return () => gulp.start.apply(gulp, args)
}

function getTask(ext) {
  switch (ext) {
    case 'js':
      if (isBrowserify) return 'brow'
      else if (isWebpack) return 'webpack'
      else return ''
    case 'css':
    case 'scss':
    case 'sass':
      return 'sass'
    case 'less':
      return 'less'
    case 'styl':
      return 'stylus'
    default:
      break
  }
}

gulp.task('init', () => {
  fs.stat(`${_pDir}/conf.proj`, (err, stat) => {
    if (stat && stat.isFile()) {
      console.log('文件已经初始化，如需重新初始化请删除目录文件')
      process.exit()
    }
  })
  return gulp.src('./tpl/**/*').pipe(gulp.dest(`${_pDir}/`))
})

const stylesObj = {
  sass: `${_pDir}/styles/*.{scss,sass,css}`,
  less: `${_pDir}/styles/*.less`,
  stylus: `${_pDir}/styles/*.styl`
}

const sourceMap = { sass, less, stylus }

Object.keys(sourceMap).forEach(key => {
  let fn = sourceMap[key]
  gulp.task(key, () => {
    return gulp
      .src(stylesObj[key])
      .pipe(plumber(onErr))
      .pipe(fn())
      .pipe(postcss('./.postcssrc.js'))
      .pipe(gulp.dest(`${_pDir}/css/`))
  })
})

gulp.task('default', () => {
  if (useBrowserSync) {
    browserSync.init({ server: _pDir })
    console.log(chalk.cyan('  Server Running.\n'))
  }

  gulp.watch([watchDir], { interval: 500, dot: true }).on('change', event => {
    const ext = path.extname(event.path).substr(1)
    let task = getTask(ext)
    setTimeout(t(task, reload), 200)
  })
})

//browserify
gulp.task('brow', () => {
  gulp.src(_pDir + '/js/dev.js').pipe(gulp.dest(`${tmp}/js/`))
  return gulp
    .src(`${tmp}/js/dev.js`)
    .pipe(plumber(onErr))
    .pipe(eslint({ configFle: './.eslintrc' }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(browFile())
    .pipe(rename('index.js'))
    .pipe(gulp.dest(_pDir + '/js/'))
})
