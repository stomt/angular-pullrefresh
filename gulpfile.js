var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

var serve = require('gulp-serve');

var paths = {
  babel : './src/**/*.js'
};

gulp.task("uglify", function() {
  gulp.src(["dist/pullrefresh.js"])     // Read the files
    .pipe(uglify())                     // Minify
    .pipe(rename({extname: ".min.js"})) // Rename to ng-quick-date.min.js
    .pipe(gulp.dest("dist"))            // Write minified to disk
});


gulp.task("css", function() {
  gulp.src(["src/*/*.css"])             // Read the files
    .pipe(concat("pullrefresh.css"))    // Combine into 1 file
    .pipe(gulp.dest("dist"));
});


gulp.task('compile', function () {
  gulp.src(paths.babel)
    .pipe(sourcemaps.init())
    .pipe(babel({
      modules : 'common'
    }))
    .pipe(concat('pullrefresh.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('serve', serve({
  root : ['./']
}));


gulp.task("build", function() {
  gulp.start("compile");
  gulp.start("uglify");
  gulp.start("css");
});


gulp.task('default', function () {
  gulp.start('serve');
  gulp.watch(paths.babel, ['compile']);
});

