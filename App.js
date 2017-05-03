//import Express from 'express';
const express = require( 'express' );
const App = express();

App.use( express.static( 'public' ) );

App.listen( 3000, function(){
  const host = this.address().address;
  const port = this.address().port;

  console.log("Example app listening at http://%s:%s", host, port)
});

App.get( '/', function( req, res ){
  res.sendFile( __dirname + '/public/client.html' );
});
