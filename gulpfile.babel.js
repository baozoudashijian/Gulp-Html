//gulpfile.babel.js
import gulp from 'gulp'; //引入依赖包，gulp必需
import babel from 'gulp-babel'; //支持ES6语法需要babel相关几个包
import cached from "gulp-cached";
import autoprefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import rev from 'gulp-rev';
import revCollector from 'gulp-rev-collector';
import imagemin from "gulp-imagemin";
import connect from "gulp-connect";
import del from 'del'; //Node原生的清除方法

gulp.task('css', () => {
  return gulp.src('src/static/sass/*.css') //读取css目录下任意多级目录下所有以.css为结尾的文件，最新版gulp中建议使用return语法
    .pipe(cached('css')) //缓存文件，避免每次重复打包
    .pipe(autoprefixer({ //自动加兼容前缀
      overrideBrowserslist: ['> 5%'], //兼容使用率超过5%的浏览器
      cascade: false //前缀美化
    }))
    .pipe(cleanCss({ //压缩CSS
      advanced: false,
      compatibility: 'ie8',
      keepBreaks: false,
      keepSpecialComments: '*'
    }))
    .pipe(rev())
    .pipe(gulp.dest('dist/css')) //保存打包后的CSS文件到dist下的css目录
    .pipe(rev.manifest()) //文件名加Hash值，配合上上行使用
    .pipe(gulp.dest('rev/css')) //保存CSS映射信息
});

gulp.task('js', function () {
  return gulp.src('src/static/js/*.js')
    .pipe(cached('js'))
    .pipe(babel())
    .pipe(uglify({ //压缩JS
      mangle: false //是否混淆变量
    }))
    .pipe(rev())
    .pipe(gulp.dest('dist/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('rev/js'))
});

gulp.task('img', function () {
  return gulp.src('src/static/img/*')
    .pipe(cached('img'))
    .pipe(imagemin()) //压缩图片，但效果不明显
    .pipe(gulp.dest('dist/img'));
});

gulp.task('html', function() {
  return gulp.src(['rev/**/*.json', 'src/*.html'])
    .pipe(cached('html'))
    .pipe(revCollector({ //更改HTML源码中链接路径
      replaceReved: true, //替换为追加Hash值后的文件名
      dirReplacements: {
        'css': 'css', //将URL中的css替换为css，其实相同则不必写
        'js': 'js'
      }
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('clear', function () {
  return del(['dist/*']); //每次打包清除dist目录
});

gulp.task("reload", function () {
  return gulp.src('src/*.html')
    .pipe(connect.reload()); //页面重新加载
})

gulp.task('watch', function() {
  gulp.watch('src/*.html', gulp.series('html')); //监听html文件变化，执行‘html’任务
  gulp.watch('src/static/sass/*.css', gulp.series('css'));
  gulp.watch('src/static/js/*.js', gulp.series('js'));
  gulp.watch('src/static/img/*', gulp.series('img'));
  gulp.watch('dist/**/*', gulp.series('reload'));
});

gulp.task('connect', function () {
  connect.server({ //启用本地服务器
    root: 'dist', //根目录
    port: 3002, //端口
    livereload: true //热更新
  });
});

gulp.task('default', gulp.series('clear', gulp.parallel('css', 'js', 'pic'), 'html')); //gulp指令默认执行的任务，series为串行执行，parallel为并行执行。这里先清空dist目录，再编译，后更改html文件

gulp.task('server', gulp.series('default', gulp.parallel('connect', 'watch'))); //开启服务器并实时更新页面