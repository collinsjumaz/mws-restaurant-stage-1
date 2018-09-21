const gulp =require('gulp');
const imagemin = require('gulp-imagemin');

// Optimize Images
gulp.task('imageMin', () =>
	gulp.src('src/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/images'))
);