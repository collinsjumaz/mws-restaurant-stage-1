const gulp =require('gulp');
const imagemin = require('gulp-imagemin');
const browserify = require('browserify')

// Optimize Images
gulp.task('imageMin', () =>
	gulp.src('src/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/images'))
);

// Minify JS
gulp.task('minify', function(){
  gulp.src('src/js/*.js')
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'));
});
///Optimize Service Worker
gulp.task('sw:dist', function () {
  const bundler = browserify('./sw.js', {debug: true}); 

  return bundler
    .transform(babelify, {sourceMaps: true})  
    .bundle()               
    .pipe(source('sw.js'))  
    .pipe(buffer())         
    .pipe($.size({ title: 'Service Worker (before)' }))
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.uglifyEs.default())     
    .pipe($.size({title: 'Service Worker (after) '}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});


// Scripts
gulp.task('scripts', function(){
  gulp.src('src/js/*.js')
      .pipe(concat('main.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'));
});

gulp.task('default', [ 'imageMin', 'scripts']);

gulp.task('watch', function(){
  gulp.watch('src/js/*.js', ['scripts']);
  gulp.watch('src/images/*', ['imageMin']);
});