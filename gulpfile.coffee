
# locations
paths =
  public : './public'
  client : './client'
  sass   : './sass'


# configuration
config =

  # compiling for React
  cjsx:
    main : "#{ paths.client }/init.cjsx"
    output:
      file      : 'bundle.js'
      directory : paths.public

  # css prefixing
  autoprefixer:
    options: 
      browsers : [ 'last 2 versions' ]
      cascade  : false

  # sass to css 
  sass:
    input   : "#{ paths.sass }/app.sass"
    output  : paths.public
    options :
      noCache : true
      style   : 'compact'



#libs
_ = require 'lodash'


# dependencies
gulp         = require 'gulp'
watchify     = require 'watchify'
browserify   = require 'browserify'
source       = require 'vinyl-source-stream'
buffer       = require 'vinyl-buffer'
sass         = require 'gulp-ruby-sass'
autoprefixer = require 'gulp-autoprefixer'


# just spit out the arguments
_echo = () -> console.log [].slice.call( arguments ).join(', ')


# watches and rebuilds changes to .cjsx files
gulp.task 'watch-cjsx', () ->

  # performs bundle process
  _bundle_cjsx = () ->
    console.log 'compiling .cjsx files'
    bundler.bundle()
      .on 'error', _echo
      .pipe source config.cjsx.output.file
      .pipe gulp.dest config.cjsx.output.directory

  # create the bundler
  bundler = watchify browserify
    transform  : [ 'coffee-reactify' ]
    extensions : [ '.cjsx' ]

  # set the entry point
  bundler.add config.cjsx.main
  
  # other events
  bundler.on 'log', _echo
  bundler.on 'update', _bundle_cjsx

  # start a build by default
  _bundle_cjsx()


gulp.task 'compile-sass', () ->
  console.log 'compiling .sass files'
  sass config.sass.input, config.sass.options 
    .pipe autoprefixer config.autoprefixer.options
    .pipe gulp.dest config.sass.output



# start watching
gulp.task 'watch', [ 'watch-cjsx', 'compile-sass' ], () ->
  gulp.watch "#{ paths.sass }/**/*.sass", [ 'compile-sass' ]


