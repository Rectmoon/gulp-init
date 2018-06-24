const config = require('./config')
const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const htmlmin = require('gulp-htmlmin')
const gulpif = require('gulp-if')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const fuleinclude = require('gulp-file-include')
const del = require('del')
const chalk = require('chalk')
const gulpSequence = require('gulp-sequence')
const uglify = require('gulp-uglify')
const stylus = require('gulp-stylus')
const sass = require('gulp-sass')
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const cleanCss = require('gulp-clean-css')
const babel = require('gulp-babel')
const cache = require('gulp-cache')
const imagemin = require('gulp-imagemin')
const pngquant = require('imagemin-pngquant')
const eslint = require('gulp-eslint')
const stripDebug = require('gulp-strip-debug')
const rename = require('gulp-rename')
const watch = require('gulp-watch')

const isProduction = process.env.NODE_ENV === 'production'
const sourceMap = {
  stylus,
  sass,
  less
}
const allTasks = [
  'html',
  'replace',
  'stylus',
  'sass',
  'less',
  'brow',
  'images',
  'static'
]

const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')

// server
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

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

function runTasks(tasks) {
  return new Promise((resolve, reject) => {
    del(path.join(__dirname, './', 'dist'))
      .then(() => {
        console.log(
          chalk.green(`
          =========================
          Dist Clean Done
          =========================
          `)
        )
        gulpSequence(tasks, () => {
          console.log(
            chalk.green(`
              =======================
              Mission Completed!
              =======================
            `)
          )
          resolve('completed')
        })
      })
      .catch(e => {})
  })
}
var browFile = require('./utils/browFile')
var initTplFile = require('./utils/initTplFile')
// 命令参数
var argv = process.argv
var taskParam = {}

for (var i = 0, l = argv.length; i < l; i++) {
  if (argv[i].indexOf('-') === 0) {
    if (argv[i + 1] && argv[i + 1].indexOf('-') === 0) {
      taskParam[argv[i]] = ''
    } else {
      taskParam[argv[i]] = argv[i + 1]
      i++
    }
  }
}
//根目录
var baseDir = '../n/'
// import export 处理
var baseBrowserifyDir = '../browserify/'
//监听目录
var pDir = taskParam['-d'] || taskParam['-p']
var _pDir = baseDir + pDir
var isServing = taskParam.hasOwnProperty('-s')

gulp.task('init', () => {
  fs.stat(baseDir + pDir + '/conf.proj', function(err, stat) {
    if (stat && stat.isFile()) {
      console.log('文件已经初始化，如需重新初始化请删除目录文件')
      process.exit()
    }
  })
  return gulp.src('./tpl/**/*').pipe(gulp.dest(baseDir + pDir + '/'))
})

gulp.task('copy', () => {
  return gulp
    .src([`${_pDir}/**/*`, `!${_pDir}/js/index.js`])
    .pipe(gulp.dest('src'))
})

gulp.task('replace', isServing ? [] : ['init'], function() {
  var pName
  if (pDir.indexOf('n/') != -1) {
    pName = pDir.substr(pDir.indexOf('n/') + 2, pDir.length - 1)
  } else {
    pName = pDir
  }
  return gulp
    .src('src/*.htm*')
    .pipe(initTplFile(baseDir + pName + '', pName, config.useBrowserify))
    .pipe(gulp.dest(baseDir + pName))
})

gulp.task('html', () => {
  return gulp
    .src(config.dev.html)
    .pipe(plumber(onErr))
    .pipe(
      fuleinclude({
        prefix: '@@',
        basepath: path.join(__dirname, './', 'src/include/')
      })
    )
    .pipe(
      gulpif(
        isProduction,
        htmlmin({
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true
        })
      )
    )
    .pipe(gulp.dest(baseDir + pDir))
})

Object.keys(sourceMap).forEach(key => {
  let fn = sourceMap[key]
  gulp.task(key, () => {
    return gulp
      .src(config.dev.styles[key])
      .pipe(plumber(onErr))
      .pipe(fn())
      .pipe(gulpif(isProduction, cleanCss({ debug: true })))
      .pipe(postcss('./.postcssrc.js'))
      .pipe(gulp.dest(baseDir + pDir + '/css/'))
  })
})

gulp.task('styles', () => {
  const tasks = ['stylus', 'sass', 'less']
  tasks.forEach(task => gulp.start(task))
})

gulp.task('images', () => {
  return gulp
    .src(config.dev.images)
    .pipe(plumber(onErr))
    .pipe(
      cache(
        imagemin({
          progressive: true, // 无损压缩JPG图片
          svgoPlugins: [{ removeViewBox: false }], // 不移除svg的viewbox属性
          use: [pngquant()] // 使用pngquant插件进行深度压缩
        })
      )
    )
    .pipe(gulp.dest(config.build.images))
})

gulp.task('eslint', () => {
  return gulp
    .src(config.dev.scripts)
    .pipe(plumber(onErr))
    .pipe(gulpif(isProduction, stripDebug()))
    .pipe(eslint({ configFle: './.eslintrc' }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

const useEslint = config.useEslint ? ['eslint'] : []
gulp.task('brow', useEslint, () => {
  gulp.src('src/js/*.js').pipe(gulp.dest(`${baseDir + pDir}/js/`))
  return gulp
    .src('src/js/dev.js')
    .pipe(plumber(onErr))
    .pipe(browFile())
    .pipe(rename('index.js'))
    .pipe(gulp.dest(baseDir + pDir + '/js/'))
})

// gulp.task('scripts', useEslint, () => {
//   return gulp
//     .src(config.dev.scripts)
//     .pipe(plumber(onErr))
//     .pipe(
//       babel({
//         presets: ['env']
//       })
//     )
//     .pipe(gulpif(config.useWebpack, webpackStream(webpackConfig, webpack)))
//     .pipe(gulpif(isProduction, uglify()))
//     .pipe(gulp.dest(baseDir + pDir + '/js/'))
// })

gulp.task('static', () => {
  return gulp.src(config.dev.static).pipe(gulp.dest(config.build.static))
})

gulp.task('clean', () => {
  del('./dist').then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'))
  })
})

gulp.task('watch', () => {
  let stylesObj = config.dev.styles
  Object.keys(stylesObj).forEach(key => {
    watch(stylesObj[key], e => {
      gulp.start(key, reload)
    })
  })
  // gulp.watch(config.dev.allhtml, ['html', 'replace']).on('change', reload)
  watch(config.dev.images, e => {
    gulp.start('image', reload)
  })
  watch(config.dev.scripts, e => {
    gulp.start('brow', reload)
  })
})

gulp.task('server', () => {
  runTasks(allTasks).then(() => {
    browserSync.init({ server: baseDir + pDir })
    console.log(chalk.cyan('  Server Running.\n'))
    gulp.start('watch')
  })
})

gulp.task('build', () => {
  runTasks(allTasks).then(() => {
    console.log(
      chalk.cyan(`
      =======================
      Build Completed.
      =======================
    `)
    )
  })
})

gulp.task('default', () => {
  // let isBrowserify = taskParam.hasOwnProperty('-b')
  //检测项目目录是否存在
  let tasks
  try {
    let stat = fs.statSync(_pDir)
    tasks = ['copy']
  } catch (e) {
    tasks = ['init', 'replace']
  }
  runTasks(tasks).then(() => {
    gulp.start('watch')
  })
})

// console.log(
//   chalk.green(
//     `
//     Build Setup:
//       开发环境： npm run dev
//       生产环境： npm run build
//       执行压缩： gulp zip
//       编译页面： gulp html
//       编译脚本： gulp scripts
//       编译样式： gulp {stylus, sass, less}
//       语法检测： gulp eslint
//       压缩图片： gulp images
//     `
//   )
// )
