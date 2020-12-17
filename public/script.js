const socket = io('/')
const videoGrid = document.getElementById('video-grid')

// These settings are needed to connect to our peerjs server
const peerSettings = {
  host: 'groupchat.ch',
  port: '9000',
  path: 'hci_app'
}

var myBubbleID = 0;
var myStream;
var myAvatarURL = null;
const callers = {};
const callees = {};
const audio_elements = {};
var me = null;
//local representation of all state (in the room)
var users = {};

let textMessages = []
var badgeCountView = null
var textMessageRecepient = null

setRoomName();

// Getting the avatar url of the user
if (avatarCookieExists()) {
	myAvatarURL = getAvatarCookie();
} else {
	// shouldn't happen in theory because new users are sen to the hub and an avatar is assigned there but who knows
	avatarGenerator = new AvatarGenerator();
	myAvatarURL = avatarGenerator.generateURLFromOptions();
	setAvatarCookie(myAvatarURL)
}

// Getting the audio stream of the user
const myAudio = document.createElement('audio');
myAudio.muted = true;
navigator.getUserMedia(
  {video: false, audio: true},

  // Success callback
  function success (localAudioStream) {
    console.log("got user audio");
    myStream = localAudioStream;
    create( );
  },

  // Failure callback
  function error(err) {
    console.log("can't get user audio");
  }
);

function create( ) {

  socket.on("users-changed", users_new => {

    //console.log( "users-changed", users_new );

    // display remote users; update position
    create_and_update_userBubbles(users_new);

    users = users_new;  //It's useful to have the old users until here

    // draw the group bubbles
    drawGroupBubblesV2(users_new);

    // display number of users
    setRoomParticipantNumber( getUserCount( ));

    // change connections with peerjs
    update_peers( );

    // display user mute status
    update_mute_icons(users_new);

    // display user megaphone status
    update_speaker_icons(users_new);
  });

  socket.on('message', (username, text) => {
    console.log("Message from " + username + ": " + text);
  });

  socket.on('new-text-message', (receiver, receivedTextMessages) => {
    if (users[USERNAME].name !== receiver) { return } // ignore if message for someone else

    console.log(`Received new text message(s)`)
    console.log(receivedTextMessages)
    textMessages = receivedTextMessages

    // call handle to do other stuff
    receivedNewTextMessage()
  })

  // Creating a new peer
  me = new Peer(undefined, peerSettings);
  me.on('open', function(){
    console.log('My PeerJS ID is:', me.id);
    init();
    socket.emit('join-room', ROOM_ID, me.id, USERNAME );
    sendAvatarURLToServer();
  });

  //for local tests
  /*
  me = {id: Math.random().toString().substr(2, 8)};
  init();
  socket.emit('join-room', ROOM_ID, me.id, USERNAME );
  */

  // someone else is calling me
  me.on('call', incoming => {

    console.log( "incoming call" );
    incoming.answer( );

    incoming.on('stream', stream => {
      callers[ incoming.peer ] = incoming;
      audio_elements[ incoming.peer ] = createStream( stream );
    });

    incoming.on('close', () => {
      console.log( "someone closed call with ", incoming.peer );
      //disconnectPeerById( incoming.peer );
      disconnectIncomingPeerById( incoming.peer );
    });

    incoming.on('error', err => {
      console.log(err);
      disconnectPeerById( incoming.peer );
    });
  });
}

// doing something with the peer's stream
// In this function, we need to take the stream and somehow connect it to the frontend
// Right now, I'm simply creating an audio element, appending it to the body and playing it.
function createStream( stream ) {

  console.log("playStream");
  var audio = document.createElement('audio');
  audio.srcObject = stream;
  document.body.append(audio);
  audio.addEventListener('loadedmetadata', () => {
    audio.play( );
  });

  return audio;
}

function connectPeerById( peerId ) {

  console.log( "connectPeerById", getUsernameById( peerId ));
  const outgoing = me.call( peerId, myStream );
  callees[ peerId ] = outgoing;
}

function disconnectPeerById( peerId ) {

  console.log("disconnectPeerById");

  disconnectOutgoingPeerById( peerId );
  disconnectIncomingPeerById( peerId );
}

function disconnectOutgoingPeerById ( peerId ) {

  console.log( "disconnectOutgoingPeerById", getUsernameById( peerId ));
  if( callees[ peerId ]) callees[ peerId ].close( );
  delete callees[ peerId ];

}

function disconnectIncomingPeerById ( peerId ) {
  console.log( "disconnectIncomingPeerById", getUsernameById( peerId ));
  if( callers[ peerId ]) callers[ peerId ].close( );
  if( audio_elements[ peerId ]) audio_elements[ peerId ].remove( );
  delete callers[ peerId ];
  delete audio_elements[ peerId ];
}

function getUsernameById( peerId ) {

  for( const k in users ) if( users[ k ].peerId == peerId ) return k;
  return undefined;
}

// sends position update to the server
function updatePlayerPosition( xPosition, yPosition ) {

  socket.emit( 'update-user', { position: [ xPosition, yPosition ] });
}

function userEnteredOfflineArea() {

  //disablePublicSpeaker( );
  //disableMute( );
  socket.emit( 'update-user', { position: "offline", muted: false, megaphone: false });
}

function updateMuteStatus(status) {

  socket.emit( 'update-user', { muted: status });
}

function updateSpeakerStatus(status) {

  socket.emit( 'update-user', { megaphone: status });
}

function msg(text) {
  socket.emit('message',text)
}

function getMyId() {
  console.log(me.id)
  return me.id;
}

function getUserCount( ) {

  var count = 0;
  for( var k in users ) { var other = users[ k ]; if( other.room == ROOM_ID && other.bubble != "offline" ) count +=1; }
  return count;
}

function update_peers( ) {

  const user = users[ USERNAME ];

  console.log("update_peers", users);

  // for( const peerId in { ...callers, ...callees }) {
  //   const name = getUsernameById( peerId );
  //   const other = users[ name ];
  //   if( other &&( other.room != ROOM_ID || other.bubble != user.bubble || user.bubble == "offline" )) disconnectPeerById( other.peerId );
  // }

  for( const peerId in { ...callees }) {

    const name = getUsernameById( peerId );
    const other = users[ name ];

    if( other &&( other.room != ROOM_ID || user.bubble == "offline" || other.bubble == "offline" || ( other.bubble != user.bubble && !user.megaphone))) {
      disconnectOutgoingPeerById( other.peerId );
    }
  }

  for( const peerId in { ...callers }) {

    const name = getUsernameById( peerId );
    const other = users[ name ];

    if( other &&( other.room != ROOM_ID || user.bubble == "offline" || other.bubble == "offline" || ( other.bubble != user.bubble && !other.megaphone))) {
      disconnectIncomingPeerById( other.peerId );
    }
  }

  for( const k in users ) {

    const other = users[ k ];

    // supporting public speaker with this version
    if( other.peerId != user.peerId && other.room == ROOM_ID && (other.bubble == user.bubble || (user.megaphone && other.bubble != "offline")) && user.bubble != "offline" && ! callees[ other.peerId ]) connectPeerById( other.peerId );

    //if( other.peerId != user.peerId && other.room == ROOM_ID && other.bubble == user.bubble && user.bubble != "offline" && ! callees[ other.peerId ]) connectPeerById( other.peerId );
  }
}

function update_mute_icons(users) {
  for (var k in users) {
    var u = users[k];
    if (u.room == ROOM_ID && u.peerId != me.id) {
      if (u.muted) {
        showMuteIconForUser(u.name);
      } else {
        hideMuteIconForUser(u.name);
      }
    }
  }
}

function update_speaker_icons(users) {
  for (var k in users) {
    var u = users[k];
    if (u.room == ROOM_ID && u.peerId != me.id) {
      if (u.megaphone) {
        showSpeakerIconForUser(u.name);
      } else {
        hideSpeakerIconForUser(u.name);
      }
    }
  }
}

function create_and_update_userBubbles(users_new) {
  for(var k in users_new) {
    var cur = users_new[k];
    if(cur.room == ROOM_ID && cur.peerId != me.id) {

      //User has joined new
      if(remoteUserViewMap[cur.peerId] == null) {
        var view;
         //kinda stupid side effect of using peerid as id here
         var samename = null;
        for(var k in users) {
          if(users[k].name == cur.name) {
            samename = users[k];
          }
        }
        if(samename != null) {
          view = remoteUserViewMap[samename.peerId];
        }
        else if(cur.bubble == "offline") {
          view = createRemoteUser(cur.peerId, cur.name, false, cur.avatarURL);
        }
        else {
          view = createRemoteUser(cur.peerId, cur.name, true, cur.avatarURL, cur.position[0], cur.position[1]);
        }
        remoteUserViewMap[cur.peerId] = view;
      }
      else {  //Existing user
        var view = remoteUserViewMap[cur.peerId];
        var olduser = users[k];

        // updating the avatarURL if necessary
        var img = view.firstChild
        var newAvatarURL = users_new[k].avatarURL
        if (newAvatarURL == null) {
        	console.log("avatarURL is null for some user. This shouldn't happen.",k)
        	const avatarGenerator = new AvatarGenerator(k)
        	newAvatarURL = avatarGenerator.generateURLFromOptions();
        }
        if (img.src != newAvatarURL) img.src = newAvatarURL


        if(cur.bubble == "offline" && olduser.bubble != "offline") {
          setRemoteUserOffline(cur.peerId, view); //This only does something if the user is not offline already
        }
        else if(cur.bubble != "offline" && olduser.bubble == "offline"){
          setRemoteUserOnline(cur.peerId, view, cur.position[0], cur.position[1]);
        }
        else if(cur.bubble != "offline") {
          translateRemoteUser(cur.peerId, view, cur.position[0], cur.position[1]);
        }
      }
    }
  }
}


function sendNewTextMessage(receiver, messageContent) {
  console.log(`Sending new text message to ${receiver}`)
  socket.emit('new-text-message', receiver, messageContent);
}

function markTextMessageAsReadAndRemoveIt(textMessage) {
  console.log(`Mark message`, textMessage, `as read`)

  socket.emit('text-message-read', USERNAME, textMessage);

  for (const [index, m] of textMessages.entries()) {
    if (m.sender === textMessage.sender && m.content === textMessage.content) {
      console.log('Message deleted locally')
      textMessages.splice(index, 1) // delete first message which matches
      break // makes sure that only 1 message is deleted
    }
}

  updateBadgeCount()
}

// called when a new text message(s) arrive
function receivedNewTextMessage() {
  updateBadgeCount()
}

function updateBadgeCount() {
  let nMessages = textMessages.length

  if (nMessages > 0) {
    badgeCountView.style.display = 'block' // show
    badgeCountView.innerHTML = String(nMessages)
  } else {
    badgeCountView.style.display = 'none' // hide
  }
}

function onBadgeClick() {
  console.log('Badge clicked')

  if (textMessages.length <= 0) { return } // don't do anything if not messages

  // display 1st message
  console.log('Display toast')

  const textMessage = textMessages[0]

  displayTextMessageInToast(textMessage)
  markTextMessageAsReadAndRemoveIt(textMessage)
}

function displayTextMessageInToast(textMessage) {
  const toast = $("#initial-toast").clone() // clone initial toast

  toast.attr('id', 'toast-clone') // change id so that we don't confuse it with the initial toast

  toast.find(".mr-auto").html(`${textMessage.sender} wrote:`) // set toast heading
  toast.find(".toast-body").html(textMessage.content) // set toast body
  // toast.find('.text-muted').html("Now") // set time

  // set callback for when toast dismissed
  toast.on('hidden.bs.toast', () => {
    toast.remove() // remove toast view from DOM
  })

  toast.appendTo('#toast-container')
  toast.toast('show')
}

function displaySenderDialogForTextMessage() {
  const toast = $("#initial-input-toast").clone() // clone initial input toast

  toast.attr('id', 'input-toast-clone') // change id so that we don't confuse it with the initial toast

  toast.find(".mr-auto").html(`Send message to ${textMessageRecepient}`) // set toast heading
  // toast.find('.text-muted').html("Now") // set time

  // set callback for when toast dismissed
  toast.on('hidden.bs.toast', () => {
    toast.remove() // remove toast view from DOM
  })

  toast.appendTo('#input-toast-container')
  toast.toast('show')
  document.getElementById( "text-message-field" ).addEventListener( "keyup", onMessageFieldEnterPressed );
  document.getElementById( "text-message-field" ).focus( );
}

function removeExistingSenderDialogForTextMessage() {
  var node = document.getElementById("input-toast-container")

  while(node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

function onSendMessageButtonPressed() {
  console.log('Button send pressed')
  const messageContent = document.getElementById('text-message-field').value

  sendNewTextMessage(textMessageRecepient, messageContent)
  $('#input-toast-clone').remove() // remove input toast from DOM
}

function onMessageFieldEnterPressed( evt ) {

  if( evt.keyCode === 13 ) onSendMessageButtonPressed( );
}

function sendAvatarURLToServer() {
	socket.emit( 'update-user', { avatarURL: myAvatarURL });
}
