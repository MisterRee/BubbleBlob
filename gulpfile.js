var gulp = require( 'gulp' ),
    debug = require( 'gulp-debug' ),
    //uglify = require( 'gulp-uglify' ),
    notify = require( 'gulp-notify' ),
    babel = require( 'gulp-babel' ),
    browserify = require( 'browserify' ),
    buffer = require( 'gulp-buffer' ),
    babelify = require( 'babelify' );

gulp.task( 'break', function(){
  gulp.src( './js/**.js' )
    .pipe( babel({ presets: [ 'react' ]}) )
    .pipe( gulp.dest( './dist' ) )
    .pipe( notify({
      message: 'Build complete',
      onLast: true
    }) )
});

gulp.task( 'browser', function(){
  var source = browserify({
    entries: './js/App.js'
  })

  source.bundle()
    .pipe( babel({ presets: [ 'react' ] }) )
    .pipe( gulp.dest( './dist' ) )
    .pipe( notify({
      message: 'Build complete',
      onLast: true
    }) )
});

// BUILDING JS
gulp.task( 'js', function(){
  browserify({
    debug: true
  })
    .transform( babelify, { presets: [ 'react' ] } )
    .require( './js/App.js', { entry: true } )
    .bundle()
    .pipe( gulp.dest( './' ) )
    .pipe( notify({
      message: 'Build complete',
      onLast: true
    }) )
});

// Runs tests on any file changes in js/ folder
gulp.task( 'watch', function(){
  gulp.watch( './js/**.js', function(){
    gulp.run( 'break' );
  });
});

gulp.task( 'default', ['break'] );
