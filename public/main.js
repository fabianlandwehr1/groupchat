function init() {
  canvas = document.getElementById("movingcanvas");
	offlinearea = document.getElementById("offlinearea");
  roomnumberinfo = document.getElementById("roomnumberinfo");
  roomparticipantsinfo = document.getElementById("roomparticipantsinfo");
  viewParent = document.getElementById("viewparent");
  drawSVG = document.getElementById("drawsvg");

  initControls();
  initlocaluserbubble();
}

function setRoomName() {
	document.getElementById("roomnumberinfo").innerHTML = "Room: " + ROOM_ID
}

function setRoomParticipantNumber( k ) {
	document.getElementById("roomparticipantsinfo").innerHTML = "" + k + " participants"
}

function setOfflineAreaScrollDown() {
  let csh = offlinearea.scrollHeight;
  offlinearea.scrollTop = csh;
}
