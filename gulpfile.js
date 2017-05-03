var gulp = require( 'gulp' ),
    debug = require( 'gulp-debug' ),
    //uglify = require( 'gulp-uglify' ),
    notify = require( 'gulp-notify' ),
    babel = require( 'gulp-babel' ),
    browserify = require( 'browserify' ),
    babelify = require( 'babelify' ),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');

// BUILDING JS
gulp.task( 'js', function(){
  browserify({
    debug: true
  })
    .transform( babelify, { presets: [ 'es2015', 'react' ] } )
    .require( './js/render.js', { entry: true } )
    .bundle()
    .pipe( source( 'bundle.js' ) )
    .pipe( gulp.dest( './public' ) )
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

gulp.task( 'default', ['js'] );

/*
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
  var b = browserify({
    entries: './js/render.js'
  });

  b.bundle()
    .pipe( source( 'bundle.js' ) )
    .pipe( buffer() )
    .pipe( babel({ presets: [ 'react' ] }) )
    .pipe( gulp.dest( './dist' ) )
    .pipe( notify({
      message: 'Build complete',
      onLast: true
    }) )
});
*/
