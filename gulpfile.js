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
const cache = require('gulp-cache')
const imagemin = require('gulp-imagemin')
const pngquant = require('imagemin-pngquant')
const eslint = require('gulp-eslint')
const stripDebug = require('gulp-strip-debug')
const watch = require('gulp-watch')
const browFile = require('./utils/browFile')
const initTplFile = require('./utils/initTplFile')

const isProduction = process.env.NODE_ENV === 'production'
const sourceMap = {
  stylus,
  sass,
  less
}
const allTasks = ['html', 'replace', 'stylus', 'sass', 'less', 'scripts', 'images', 'static']

// const webpack = require('webpack')
// const webpackStream = require('webpack-stream')
// const webpackConfig = require('./webpack.config.js')

// server
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

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
//根目录
let baseDir = '../n/'
//监听目录
let pDir = taskParam['-d'] || taskParam['-p']
let _pDir = baseDir + pDir
let browFiles = config.files.map(item => `src/scripts/${item}.js`)

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

function runTasks(tasks, sync) {
  return new Promise((resolve, reject) => {
    del(['src/**/*', '!src/*.html'])
      .then(() => {
        if (sync) {
          gulpSequence.apply(null, tasks)(() => {
            resolve('completed')
          })
        } else {
          gulpSequence(tasks, () => {
            resolve('completed')
          })
        }
      })
      .catch(e => {
        reject('error')
      })
  })
}

function pickOpts(obj, arr) {
  return arr.reduce((target, key) => {
    target[key] = obj[key]
    return target
  }, {})
}

gulp.task('init', () => {
  fs.stat(`${_pDir}/conf.proj`, (err, stat) => {
    if (stat && stat.isFile()) {
      console.log('文件已经初始化，如需重新初始化请删除目录文件')
      process.exit()
    }
  })
  gulp.src(['./tpl/dev/**/*']).pipe(gulp.dest('src'))
  return gulp.src('./tpl/**/*').pipe(gulp.dest(`${_pDir}/`))
})

gulp.task('copy', () => {
  return gulp.src([`${_pDir}/dev/**/*`, `${_pDir}/**/*.html`]).pipe(gulp.dest('src'))
})

gulp.task('replace', ['init'], () => {
  let pName = pDir.indexOf('n/') != -1 ? pDir.substr(pDir.indexOf('n/') + 2, pDir.length - 1) : pDir
  try {
    fs.statSync(`./src/index.html`)
    return gulp
      .src('src/*.htm*')
      .pipe(initTplFile(baseDir + pName + '', pName))
      .pipe(gulp.dest(baseDir + pName))
  } catch (e) {
    console.log('请在src目录新建index.html文件')
    del('src/**/*').then(() => {
      process.exit()
    })
  }
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
    .pipe(gulp.dest(_pDir))
})

Object.keys(sourceMap).forEach(key => {
  let fn = sourceMap[key]
  gulp.task(key, () => {
    gulp.src(config.dev[key]).pipe(gulp.dest(`${_pDir}/dev/styles/`))
    return gulp
      .src(pickOpts(config.dev, ['stylus', 'sass', 'less'])[key])
      .pipe(plumber(onErr))
      .pipe(fn())
      .pipe(gulpif(isProduction, cleanCss({ debug: true })))
      .pipe(postcss('./.postcssrc.js'))
      .pipe(gulp.dest(`${_pDir}/css/`))
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
gulp.task('scripts', useEslint, () => {
  gulp.src('src/scripts/**/*.js').pipe(gulp.dest(`${_pDir}/dev/scripts/`))
  return gulp
    .src(browFiles)
    .pipe(plumber(onErr))
    .pipe(browFile())
    .pipe(gulp.dest(`${_pDir}/js/`))
})

gulp.task('static', () => {
  return gulp.src(config.dev.static).pipe(gulp.dest(config.build.static))
})

gulp.task('clean', () => {
  del('src/**/*').then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'))
  })
})
gulp.task('watch', () => {
  let devObj = config.dev
  Object.keys(devObj).forEach(key => {
    watch(devObj[key], e => {
      gulp.start(key, reload)
    })
  })
})

gulp.task('server', () => {
  browserSync.init({ server: _pDir })
  console.log(chalk.cyan('  Server Running.\n'))
})

gulp.task('build', () => {
  runTasks(allTasks).then(() => {
    console.log(
      chalk.cyan(`
      =======================
      Build Done.
      =======================
    `)
    )
  })
})

gulp.task('default', () => {
  let tasks = ['copy', 'stylus', 'sass', 'less', 'images']
  //检测项目目录是否存在
  try {
    fs.statSync(_pDir)
  } catch (e) {
    try {
      fs.statSync(`src/index.html`)
      tasks.unshift('replace')
    } catch (err) {
      console.log('请在src目录新建index.html')
      process.exit()
    }
  }
  taskParam.hasOwnProperty('-b') && tasks.push('scripts')
  taskParam.hasOwnProperty('-s') && tasks.push('server')
  runTasks(tasks, true).then(() => {
    gulp.start('watch')
  })
})
