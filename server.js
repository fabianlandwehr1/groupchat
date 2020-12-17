const express = require('express')
const app = express()

const https = require('https');
const fs = require('fs');
const server = https.createServer({
  cert: fs.readFileSync('./certificate.crt'),
  ca: fs.readFileSync('./ca_bundle.crt'),
  key: fs.readFileSync('./private.key')
}, app)

const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const url = require('url');
const bubble = require('./bubble');

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {

  res.redirect(`/startpage/startpage.html`)
})

app.get('/avatarcreator', (req, res) => {
  console.log('redirect to avatarcreator')
  res.redirect('/avatarcreator/avatarcreator.html')
})

app.get('/:room', (req, res) => {
  console.log('redirect to room')
  res.render('room', { roomId: req.params.room, username: get_username( req )})
})

function get_username( req ) {

  const q = url.parse(req.url, true).query;
  return q.username ? q.username : uuidV4( ).substring( 0, 4 );
}

//will hold all server state, identified by username
const users = {};

const textMessagesPerUser = {}

io.on('connection', socket => {

  console.log('a user connected');
  var user = null;
  socket.on('join-room', ( room, peerId, username ) => {

    console.log("user " + username + " joined room " + room + " with " + peerId );

    user = users[ username ] = { name: username, room: room, peerId: peerId, bubble: "offline", position: "offline", muted: false, megaphone: false, connected: true, avatarURL: null };
    socket.join( user.room );

    broadcast_users_to( user.room );

    // create text messages array if it doesn't exist from a previous connection
    if (!textMessagesPerUser[username])
      { textMessagesPerUser[username] = [] }
    // deliver messages which were received while offline or from previous connection
    socket.emit('new-text-message', username, textMessagesPerUser[username]);

    socket.on( "update-user", update => {

      console.log( "update-user", update );
      update_jso( user, update );

      if( update.hasOwnProperty( "position" )) {

        recompute_bubbles( user.room );
      }

      broadcast_users_to( user.room );
    });

    socket.on("message", text => {

      console.log( "message", user.name, text );
      io.in( user.room ).emit( "message", user.name, text );
    });

    // called when a user sends a text message to another user
    // - message get stored on server (in case user is offline) and send to the user
    socket.on('new-text-message', (receiver, messageContent) => {
      const textMessage = { sender: user.name, content: messageContent }
      console.log(`User ${user.name} sent text message '${messageContent} to ${receiver}`)

      // messages are of the format {sender: username, content: str}
      textMessagesPerUser[receiver].push(textMessage)

      console.log(textMessagesPerUser[receiver])

      // send to everyone and then the locally only accept if names match
      io.to(room).emit('new-text-message', receiver, textMessagesPerUser[receiver]);
    })

    // called when user read a message
    // - remove message from server
    socket.on('text-message-read', (receiver, textMessage) => {
      console.log(`Mark text message for ${receiver} as read, message:`, textMessage)

      let receiverMessages = textMessagesPerUser[receiver]

      for (const [index, m] of receiverMessages.entries()) {
        // gotta check manuall each field as javascript, lmaooooo
        if (m.sender === textMessage.sender && m.content === textMessage.content) {
          console.log('Message deleted locally')
          textMessagesPerUser[receiver].splice(index, 1) // delete first message which matches
          break // makes sure that only 1 message is deleted
        }
      }

      console.log('Messages left', textMessagesPerUser[receiver])
    })

  });

  socket.on('disconnect', () => {

    if( user ) {

      console.log( user.name + " disonnected" );
      update_jso( user, { bubble: "offline", position: "offline", muted: false, megaphone: false, connected: false });
      broadcast_users_to( user.room );
    }
  });
})

function broadcast_users_to( room ) {

	var relevant = {};
	for( const k in users ) { if( users[ k ].room == room ) relevant[ k ] = users[ k ]; }

	io.in( room ).emit( "users-changed", relevant );
    console.log( relevant );
}

// Applies the keys in 'update' as an incremental change to 'old' javascript object
function update_jso( old, update ) {

  for( var key in update ) {

    if( old.hasOwnProperty( key )) {

      old[ key ] = update[ key ];
    }
  }
}

function recompute_bubbles( room ) {

	//the proper bubble algorithm
	var xs = [ ];
	var ys = [ ];
	var b = [ ];
	const relevant = Object.keys( users ).sort( ).filter( k => { const u = users[ k ]; return u.position != "offline" && u.room == room });

	for( var i = 0; i < relevant.length; ++ i ) {

		const u = users[ relevant[ i ]];
		xs.push( u.position[ 0 ]);
		ys.push( u.position[ 1 ]);
		b.push( u.bubble == "offline" ? smallest_free_bubble( relevant ) : Number( u.bubble ));
	}

	const b_prime = bubble.algo( xs, ys, b ).bubbles;

	for( var i = 0; i < relevant.length; ++ i ) {

		const k = relevant[ i ];
		users[ k ].bubble = b_prime[ relevant.indexOf( k )];
	}

  // Fix for "offline" not existing as a bubble
  for (const key in users) {
    const u = users[key];

    if (u.position == 'offline') {
      users[key].bubble = 'offline'
    }
  }

	//fallback do not delete
	/*for( var k in users ) {

      const u = users[ k ];
      u.bubble = ( u.position == "offline" ) ? "offline" : 0;
    }*/
}

function smallest_free_bubble( relevant ) {

	var free = 0;
	while( relevant.filter( k => users[ k ].bubble == free ).length > 0 ) free += 1;
	return free;
}

// default https port
server.listen(443);

// emit = everyone
// broadcast.emit = everyone except me

// http server that redirects all traffic to https

var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);
