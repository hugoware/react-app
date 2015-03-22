var $ = module.exports
  , $fs = require('fs')
  , $path = require('path')
  , $http = require('http')
  , $query = require('querystring')
  , $run = require('child_process').spawn

  // track our own simple list
  , $mime_types = {
      '.txt'  : 'text/plain',
      '.html' : 'text/html',
      '.css'  : 'text/css',
      '.js'   : 'text/javascript',
      '.json' : 'application/json',
      '.png'  : 'image/png',
      '.gif'  : 'image/gif',
      '.jpg'  : 'image/jpeg',
      '.jpeg' : 'image/jpeg'
    }

  // list of handlers to use
  , $resources
  , $handlers = [ ];



// gets the request ready to use
function _prepare_request( request, response ) {
  request.post = /post/i.test( request.method );
  request.get = !request.post;

  // get request just pass through
  if ( !request.post ) return _handle_request( request, response );

  // prepare data
  var body = '';
  request.on('data', function( data ) { body += data; });
  request.on('end', function() {

    // and add it to the request
    request.data = $query.parse( body );
    _handle_request( request, response );
  });
}



// sets the public resources, files, etc directory
function _setup_public_directory() {
  var directory = $.config.public || './public'
    , root = $path.resolve( __dirname, directory );

  // handle file requests
  _add_handler({ route: /^(.*$)/, resources: true, root: root,
    handler: function( request, response ) {
      var location = $path.resolve( $path.join( root, request.url ));
      response.file( location );
    }});
}


// simple redirect
function _as_redirect( response, url ) {
  response.writeHead( 302, { 'Location': url });
  response.end();
}


// tries to grab a file and overrides with a 404 if it doesn't exist
function _use_file( path, response, callback ) {
  $fs.exists( path, function( exists ) {
    if ( !exists ) return _as_404( response );
    callback( response, path );
  });
}


// nothing was found
function _as_404( response ) {

  // custom 404 handling
  if ( $.missing.handle )
    return $.missing.handle( response.request, response );

  // default handling
  response.writeHead( 404, { 'Content-Type': $mime_types['.txt'] });
  response.end('not found');
}


// reads and returns file content
function _as_file( response, path ) {
  _use_file( path, response, function() {

    // get the content
    var ext = $path.extname( path ).toLowerCase()
      , type = $mime_types[ ext ] || 'text/plain';

    // read the file
    $fs.readFile( path, function( err, contents ) {
      if ( err ) return _as_404( response );
      response.writeHead( 200,{ 'Content-Type': type, 'Content-Length': contents.length });
      response.end( contents );
    });
  });

}


// sends a javascript object as data
function _as_json( response, data ) {
  var content = JSON.stringify( data );
  response.writeHead( 200,{ 'Content-Type': 'text/json', 'Content-Length': content.length });
  response.end( content );
}

// handles the actual request
function _handle_request( request, response ) {
  console.log('['+ ( request.post ? 'POST' : 'GET' ) +']', request.url );

  // add some helpers
  response.redirect = function( url ) { _as_redirect( response, url ); };
  response.json = function( data ) { _as_json( response, data ); };
  response.file = function( path ) { _as_file( response, path ); };

  // shorcut to return a resource
  response.resource = function( path ) {
    if ( !$resources ) throw 'no resource directory';
    path = $path.resolve( $path.join( $resources.root, path ));
    _as_file( response, path );
  };

  // check if this matches anything
  var use;
  for ( var i in $handlers ) {
    var handler = $handlers[ i ]
      , method = request.post && handler.post || request.get && handler.get
      , route = method && handler.route( request.url )
      , matches = method && route;

    // use the handler if it works
    if ( !matches ) continue;

    // save handler tp use
    use = handler.handler;
    break;
  }

  // if it doesn't match, run the resources
  if ( !use && $resources )
    use = $resources.handler;

  // if still nothing, just end
  if ( use ) use( request, response );
  else _as_404( response );

}


// includes a new resource handler
function _add_handler( params ) {
  var route = params.route;

  // simple string matching
  if ( typeof route === 'string' )
    params.route = function( url ) {
      return (url+'').toLowerCase() == route;
    };

  // using a regular expression
  else if ( route instanceof RegExp )
    params.route = function( url ) {
      return (url+'').toLowerCase().match( route );
    };

  // save the location
  if ( params.resources ) $resources = params;
  else $handlers.push( params );
}


// additional custom mime types
$.type = function( ext, type ) {
  $mime_types[ ext ] = type;
  return $;
};

// start listening for requests
$.listen = function( port ) {

  // use configs to setup other info
  _setup_public_directory();

  // set up the server
  var server = $http.createServer( _prepare_request );
  server.listen( port );
  console.log('[server] started on port', port );
  return $;
};

// handles gets
$.get = function( route, handle ) {
  _add_handler({ route: route, get: true, handler: handle });
  return $;
};

// handles posts
$.post = function( route, handle ) {
  _add_handler({ route: route, post: true, handler: handle });
  return $;
};

// handles posts and gets
$.all = function( route, handle ) {
  _add_handler({ route: route, get: true, post: true, handler: handle });
  return $;
};

// if this is a 404
$.missing = function( handle ) {
  $.missing.handle = handle;
  return $;
};

// maps a route to a resource
$.resource = function( route, path ) {
  return $.all( route, function( request, response ) {
    response.resource( path );
  });
};

// maps a route to a file
$.file = function( route, path ) {
  return $.all( route, function( request, response ) {
    response.file( path );
  });
};

// sets a configuration value
$.config = function( key, value ) {
  $.config[ key ] = value;
};

// shortcuts to create handlers
$.as = function( command ) {
  var args = [].slice.call( arguments, 1 );
  return function( req, res ) { res[ command ].apply( res, args ); };
};

