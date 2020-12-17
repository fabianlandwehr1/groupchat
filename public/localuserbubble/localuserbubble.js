var drag = null;

//Creates the userbubble which represents the local user and makes it draggable
function initlocaluserbubble() {

  positionUpdateHandler = new PositionUpdateHandler();
  positionUpdateHandler.startCheckingForPositionUpdates();

  localUserBubbleView = getUserBubbleViewNew( USERNAME, myAvatarURL, true);

  const skip = () => true;
  drag = new Drag(localUserBubbleView, { onstart: onstartdrag, onend: onenddrag});
  drag.AddContainer(canvas, 1, skip, dragOverCanvas, placeOnline, skip );
  drag.AddContainer(offlinearea, 1, freeFromOfflineAreaHack, preventViewParentLeave, placeOffline, skip );
  drag.AddContainer(viewParent, 0, skip, preventViewParentLeave, function(evt, drag) {drag.ResetToDragBegin(evt); }, skip);

  let dummyScrollHack = document.createElement("div");
  dummyScrollHack.id = "dummyScrollHack";
  dummyScrollHack.style.display = "contents";
  document.body.appendChild(dummyScrollHack);

  placeOffline(null, drag);

  // add badge for notifications/messages
  badgeCountView = document.createElement('div')
  badgeCountView.id = 'badge'
  badgeCountView.classList.add('badge')
  badgeCountView.style.display = 'none' // initially hide badge

  badgeCountView.onmousedown = e => e.stopPropagation( );
  badgeCountView.onclick = onBadgeClick;

  localUserBubbleView.appendChild(badgeCountView)
}

function onstartdrag( ) {

	localUserBubbleView.classList.add( "drag" );
}

function onenddrag ( ) {

	localUserBubbleView.classList.remove( "drag" );
}

function freeFromOfflineAreaHack(evt, drag) {
  let dummyScrollHack = document.getElementById("dummyScrollHack");
  let lubvp = localUserBubbleView.parentElement;
  let bb = localUserBubbleView.getBoundingClientRect();
  if(lubvp == offlinearea) {
    lubvp.removeChild(localUserBubbleView);
  }
  dummyScrollHack.appendChild(localUserBubbleView);
  drag.ResetPositionState();
  drag.UpdatePosition(bb.x, bb.y);
  drag.oldposX = drag.futureX;
  drag.oldposY = drag.futureY;
  drag.initialX = evt.clientX;
  drag.initialY = evt.clientY;
  drag.isDrag = true;
}

//Adds the bubble to the canvas as a child (no visible change)
function placeOnline(evt, drag) {
  let lubvp = localUserBubbleView.parentElement;
  if(lubvp != canvas) {
    var bb = localUserBubbleView.getBoundingClientRect();
    if(lubvp != null) {
      lubvp.removeChild(localUserBubbleView);
    }
    canvas.appendChild(localUserBubbleView);
    drag.ResetPositionState();
    drag.UpdatePosition(bb.x, bb.y);

    addOnlineUserBubble(me.id, 0, 0); //x, y doesn't matter here, it gets overwritten by the localchangehandler
    localUserPositionChangeHandler(true);
    console.log("I am online now");

    // remove grayscale
    for (const child of localUserBubbleView.children) {
      child.style.filter = "grayscale(00%)";
    }

    enableLocalUserControls();

  }
}

//Adds the userbubble to the offline area (and resets its position)
function placeOffline(evt, drag) {
  let lubvp = localUserBubbleView.parentElement;

  if(lubvp != offlinearea) {
    if(lubvp != null) {
      lubvp.removeChild(localUserBubbleView);
    }

    userEnteredOfflineArea();
    removeOnlineUserBubble(me.id);

    offlinearea.appendChild(localUserBubbleView);

    // apply grayscale
    for (const child of localUserBubbleView.children) {
      if (child === badgeCountView) { continue } // skip badge count view as it should still be bright red

      child.style.filter = "grayscale(90%)";
    }
  }

  drag.ResetPositionState();
  setOfflineAreaScrollDown();
  console.log("I am offline now");
  disableMute();
  disablePublicSpeaker();
  disableLocalUserControls();
}

//Don't let the bubble leave the viewparent
function preventViewParentLeave(evt, dragger, oldX, oldY, newX, newY) {
  bb = localUserBubbleView.getBoundingClientRect();
  let vecX = newX - oldX;
  let vecY = newY - oldY;
	tl = dragger.RelativeToElement(viewparent, bb.x + vecX, bb.y + vecY);
	tr = dragger.RelativeToElement(viewparent, bb.right + vecX, bb.bottom + vecY);
	parbb = viewparent.getBoundingClientRect();
	if(tl[0] < 0 || tl[1] < 0 || tr[0] > parbb.width || tr[1] > parbb.height) {
    var nposx, nposy;
    if(tl[0] < 0) {
        nposx = Math.max(tl[0], 0);
    }
    else {
        nposx = Math.min(tl[0], parbb.width-bb.width);
    }
    if(tl[1] < 0) {
        nposy = Math.max(tl[1], 0);
    }
    else {
      nposy = Math.min(tr[1]-bb.height, parbb.height-bb.height);
    }
    dragger.UpdatePositionRelativeTo(viewparent, nposx, nposy);
		return false;
	}
	return true;
}

//Helper function that does all updates necessary when the local user moved on the canvas
function localUserPositionChangeHandler(justcameonline = false) {
  let bb = canvas.getBoundingClientRect();
  let bc = localUserBubbleView.getBoundingClientRect();
  let mlubX = bc.x + fixedUserBubbleWidth / 2 - bb.x;
  let mlubY = bc.y + fixedUserBubbleHeight / 2 - bb.y;

  let percentMlubX = (mlubX / bb.width) * 100;
  let percentMlubY = (mlubY / bb.height) * 100;
  positionUpdateHandler.updatePosition(percentMlubX, percentMlubY)
  //updatePlayerPosition(percentMlubX, percentMlubY);

  let myIndex = globPlayerIdToIndexStore[me.id];
  globPlayerXs[myIndex] = percentMlubX;
  globPlayerYs[myIndex] = percentMlubY;

  let mxp = justcameonline ? myIndex : null;
}

//Send updates, create groups, ... (at least if child of canvas, ie online)
function dragOverCanvas(evt, dragger, oldX, oldY, newX, newY) {

  if(localUserBubbleView.parentElement == canvas) {
    localUserPositionChangeHandler();
  }

	return preventViewParentLeave(evt, dragger, oldX, oldY, newX, newY);
}

class PositionUpdateHandler {
  constructor () {
    this.oldX = 0;
    this.oldY = 0;
    this.newX = 0;
    this.newY = 0;
    this.interval = null;
  }

  startCheckingForPositionUpdates() {
    this.interval = setInterval(function(positionUpdateHandler) {
      if (positionUpdateHandler.oldX != positionUpdateHandler.newX || positionUpdateHandler.oldY != positionUpdateHandler.newY) {
        updatePlayerPosition(positionUpdateHandler.newX, positionUpdateHandler.newY);
        positionUpdateHandler.oldX = positionUpdateHandler.newX;
        positionUpdateHandler.oldY = positionUpdateHandler.newY;
      }
    },100,this);
  }

  stopCheckingForPositionUpdates() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  updatePosition(x,y) {
    this.newX = x;
    this.newY = y;
  }
}
