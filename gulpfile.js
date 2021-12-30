var gulp = require('gulp'),
  sass = require('gulp-sass'),
  watch = require('gulp-watch'),
  browser = require('browser-sync'),
  fileinclude  = require('gulp-file-include'),
  imagemin = require('gulp-imagemin'),
  replace = require('gulp-replace')

// 不同环境相关配置
var  public_path = process.env.NODE_ENV == "development" ?  './' : 'https://www.baidu.com/'
var tastArr = process.env.NODE_ENV == "development" ? ['watch', 'serve', 'sass', 'js', 'html', 'image', 'pages'] : ['sass', 'js', 'html', 'image', 'pages']

var path = {
    sass: 'src/sass/*.scss',
    js: 'src/js/*.js',
    html: 'src/*.html',
    image: 'src/image/*.{png,jpg,gif,ico}',
    pages: 'src/pages/*.html'
}

// 编译sass
gulp.task('sass', function(){
    gulp.src(path.sass)
      .pipe(sass())
      .pipe(gulp.dest('./build/css/'));
});

// 编译js
gulp.task('js', function(){
    gulp.src(path.js)
      .pipe(gulp.dest('./build/js/'));
});

// 编译html
gulp.task('html', function(){
    gulp.src(path.html)
      .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file',
          context: {
              OA: 'pc'
          }
      }))
      .pipe(replace('./',public_path))
      .pipe(gulp.dest('./build/'));
});

gulp.task('pages', function(){
    gulp.src(path.pages)
      .pipe(gulp.dest('./build/pages/'));
});

// 压缩图片
gulp.task('image', function(){
    gulp.src(path.image)
      .pipe(gulp.dest('./build/image/'));
});

// 自动刷新 检测src || build
var DEV = 'build';
gulp.task('serve', function() {
    browser.init({
        server: DEV + '/'
    });
    gulp.watch(DEV + '/*.html' ).on('change', browser.reload)
    gulp.watch(DEV + '/js/*.js').on('change', browser.reload)
    gulp.watch(DEV + '/image/*.{png,jpg,gif,ico}').on('change', browser.reload)
    gulp.watch(DEV + '/pages/*.html').on('change', browser.reload)
});

gulp.task('watch', function(){
    gulp.watch(path.sass, ['sass']);
    gulp.watch(path.js, ['js']);
    gulp.watch(path.html, ['html']);
    gulp.watch(path.image, ['image']);
    gulp.watch(path.pages, ['pages']);
});

// default是gulp执行任务的入口必须存在
gulp.task('default', tastArr);