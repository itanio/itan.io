var gulp = require('gulp');
var postcss = require('gulp-postcss');
var tailwindcss = require('tailwindcss');
var browserSync = require('browser-sync').create();

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
        baseDir: 'app'
        },
    })
})

gulp.task('css', function(){
    return gulp.src('app/scss/styles.css')
    // ...
    .pipe(postcss([
      // ...
      tailwindcss('./tailwind.js'),
      require('autoprefixer'),
      // ...
    ]))
    // ...
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
        stream: true
    })),
    console.log('Got here');
});

gulp.task('watch', ['browserSync' , 'css'], function(){
    gulp.watch('app/scss/**/*.css', ['css']); 
    gulp.watch('app/*.html', browserSync.reload); 
    gulp.watch('app/js/**/*.js', browserSync.reload);
  })

