var browserSync = require('browser-sync').create();
var cache = require('gulp-cache');
var cssnano = require('gulp-cssnano');
var del = require('del');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var postcss = require('gulp-postcss');
var runSequence = require('run-sequence');
var tailwindcss = require('tailwindcss');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');

// Development tasks
// -----------------

gulp.task('browserSync', function() {
    browserSync.init({
        server: true
    })
})

gulp.task('watch',function(){
    gulp.watch('css-src/**/*.css', ['css']); 
    gulp.watch('*.html', browserSync.reload); 
    gulp.watch('js/**/*.js', browserSync.reload);
})

gulp.task('css', function(){
    return gulp.src('css-src/styles.css')
    .pipe(postcss([
      tailwindcss('./tailwind.js'),
      require('autoprefixer')
    ]))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
        stream: true
    }))
})

// Optimization tasks
// -----------------

// Clean dist folder
gulp.task('clean:dist'), function(){
    return del.sync('dist');
}

// Concatenate and optimize JS and CS
gulp.task('optimize', function() {
    return gulp.src('*.html')
      .pipe(useref())
      .pipe(gulpIf('*.js', uglify()))
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('dist'))
})

// Optimize Images 
gulp.task('images', function() {
    return gulp.src('images/**/*.+(png|jpg|jpeg|gif|svg)')
      // Caching images that ran through imagemin
      .pipe(cache(imagemin({
        interlaced: true,
      })))
      .pipe(gulp.dest('dist/images'))
})

// Copy favicons
gulp.task('favicons', function() {
    return gulp.src('favicons/**/*')
      .pipe(gulp.dest('dist/favicons'))
})

// Task Sequences
// -----------------

gulp.task('default', function(callback){
    runSequence(
        ['css','browserSync'], 
        'watch',
        callback
    )
})

gulp.task('build', function(callback) {
    runSequence(
        'clean:dist',
        'css',
        ['optimize', 'images', 'favicons'],
        callback
    )
  })

