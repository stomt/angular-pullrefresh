var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

gulp.task("js", function() {
  gulp.src(["src/js/*.js"])            // Read the files
    .pipe(concat("pullrefresh.js"))   // Combine into 1 file
    .pipe(gulp.dest("dist"))            // Write non-minified to disk
    .pipe(uglify())                     // Minify
    .pipe(rename({extname: ".min.js"})) // Rename to ng-quick-date.min.js
    .pipe(gulp.dest("dist"))            // Write minified to disk
});

gulp.task("default", function() {
  gulp.start("js");
});
