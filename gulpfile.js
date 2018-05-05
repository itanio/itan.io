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
var swPrecache = require('sw-precache');


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

// Concatenate and optimize JS and CSS
gulp.task('optimize', function() {
    return gulp.src('*.html')
      .pipe(useref())
      .pipe(gulpIf('*.js', uglify()))
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('dist'))
})

//Create service worker
gulp.task('generate-service-worker', function(callback) {
    var rootDir = 'dist';
  
    swPrecache.write('dist/service-worker.js', {
      staticFileGlobs: [
          rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}',
      ],
      stripPrefix: rootDir
    }, callback);
  });

// Optimize Images 
gulp.task('images', function() {
    return gulp.src('images/**/*.+(png|jpg|jpeg|gif|svg)')
      // Caching images that ran through imagemin
      .pipe(cache(imagemin({
        interlaced: true,
      })))
      .pipe(gulp.dest('dist/images'))
})

// Copy favicons and other bits
gulp.task('favicons', function() {
    return gulp.src('*.{png,ico,svg,webmanifest,xml}')
    .pipe(gulp.dest('dist'))
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
        'generate-service-worker',
        callback
    )
  })

