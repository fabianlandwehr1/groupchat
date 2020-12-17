/*
Doc:

u = new Drag(obj) -> makes obj draggable, where obj is any html element
u.AddContainer(element, priority, onstart, ondrag, onend, onleave) -> obj "reacts" if it's somehow in touch with element (which can be any html element)
                                                                    if it's picked up from within element onstart is called,
                                                                    if dragged over the element ondrag is called (note that ondrag is also called
                                                                    once obj leaves the element, right before onleave is called),
                                                                    if the drag stops on the element onend is called. onleave is called
                                                                    if obj leaves the element (ie. is dragged out).
                                                                    Note that both ondrag and onleave have to return true/false. If they return false
                                                                    the operation is canceled (ie no drag/leave is executed).
                                                                    priority defines which container methods are called if obj is over multiple containers
                                                                    at the same time. (The one with the highest priority is called; if multiple with
                                                                    the same highest priority are present, any is called)

u.UpdatePosition(x,y) -> set element to absolute x, y (relative to document)
u.UpdatePositionRelativeTo(element, x, y) -> set element relative to the top left corner of element.
u.ResetPositionState() -> resets all the state of the current positon. This method should be called once, if the parent of the child is changed,
                            or the position of obj somehow else changes. It's automatically called if a new Drag() is initialized.
u.RelativeToElement(element, x, y) -> get coordinates relative to top left corner given absolute coordinates (more of a convenience thing)

All other methods should be regarded as "private" ie not for external use.
Use optional callback methods in constructor
*/
const DRAG_VERBOSE = false;
const skip = ()=>{};
class Drag {

  constructor(obj, callback = { onstart: skip, onend: skip }) {
    this.internal_obj = obj;
    this.containers = [];
    this.currentContainer = null;

    this.ResetPositionState();

    var indirect = this;
    this.internal_obj.addEventListener("mousedown", function(evt) {indirect._startdrag(evt)});
    document.addEventListener("mouseup", function(evt) {indirect._enddrag(evt)});
    document.addEventListener("mousemove", function(evt) {indirect._dodrag(evt)});
    this.callback = callback;
  }

  //Element: The container. priority: Highest gets called if multiple possible. onX... associated methods.
  AddContainer(element, priority, onstart, ondrag, onend, onleave) {
    var container = {element: element, priority: priority, onstart: onstart, ondrag: ondrag, onend: onend, onleave: onleave};
    this.containers.push(container);
  }

  //Returns the coordinates relative to an element
  RelativeToElement(element, x, y) {
    var boundingbox = element.getBoundingClientRect();
    let locxpos = x - boundingbox.x;
    let locypos = y - boundingbox.y;
    return [locxpos, locypos];
  }

  // Enables a transition for everything for 200ms
  EnableSnappingOnNextAction() {
    const classList = this.internal_obj.classList;

    classList.add( "snap" );

    setTimeout(function(classList){
      classList.remove( "snap" );
    }, 200, classList)

  }

  ResetPositionState() {
    this.isDrag = false;
    this.initialX = -1;
    this.initialY = -1;

    this.internal_obj.style.transform = null;
    var bb = this.internal_obj.getBoundingClientRect();
    /*
    this.posZeroX = bb.x;
    this.posZeroY = bb.y;
    this.oldposX = this.posZeroX;
    this.oldposY = this.posZeroX;
    this.futureX = this.posZeroX;
    this.futureY = this.posZeroY;
    */
    //-> this is all relative to the original position
    this.posZeroX = bb.x;
    this.posZeroY = bb.y;
    this.oldposX = 0;
    this.oldposY = 0;
    this.futureX = 0;
    this.futureY = 0;
  }

  //updates relative to the actual zero position of the object
  _updatePositionInternal(newposX, newposY) {
      var xv = newposX;
      var yv = newposY;
      this.internal_obj.style.transform = "translate3d(" + xv + "px, " + yv + "px, 0)";
      this.futureX = xv;
      this.futureY = yv;
  }

  //Updates with respect to the document
  UpdatePosition(newposX, newposY) {
    this._updatePositionInternal(newposX - this.posZeroX, newposY - this.posZeroY);
  }

  //Updates with respect to an element
  UpdatePositionRelativeTo(element, relX, relY) {
    var boundingbox = element.getBoundingClientRect();
    this.UpdatePosition(boundingbox.x + relX, boundingbox.y + relY);
  }

  //Can be used to reset a drag (must be called at latest in reation to onend, otherwise the info is discarded)
  ResetToDragBegin(evt) {
    //var oldC = this._whichContainer( this.oldposX + this.posZeroX, this.oldposY + this.posZeroY );
    //oldC.onend( evt, this ); -> i m not sure if we even need this. With high probability this is actually the chain that generates the overflow
    this.UpdatePosition( this.oldposX + this.posZeroX, this.oldposY + this.posZeroY );
  }

  _isInRect(xpos, ypos, rect) {
    return xpos >= rect.x && xpos <= rect.right && ypos >= rect.y && ypos <= rect.bottom;
  }

  _whichContainer(xpos, ypos) {
    var currentC = null;

    for(var i = 0; i < this.containers.length; i++) {
        var boundingbox = this.containers[i].element.getBoundingClientRect();
        if(this._isInRect(xpos, ypos, boundingbox)) {
          if(currentC == null || currentC.priority < this.containers[i].priority) {
            currentC = this.containers[i];
          }
        }
    }

    return currentC;
  }

  _startdrag(evt) {

    if( DRAG_VERBOSE ) console.log( "_startdrag" );
    this.isDrag = true;
    this.initialX = evt.clientX;
    this.initialY = evt.clientY;
    this.oldposX = this.futureX;
    this.oldposY = this.futureY;
    //this.internal_obj.setPointerCapture(true);

    var ct = this._whichContainer(this.initialX, this.initialY);
    this.currentContainer = ct;
    if(ct != null && ct.onstart != null) {
      ct.onstart(evt, this);
    }

    this.callback.onstart( );
  }

  _enddrag(evt) {

    if( DRAG_VERBOSE ) console.log( "_enddrag", this.isDrag );
    if( this.isDrag ) {

      this.isDrag = false;
      var ct = this._whichContainer(evt.clientX, evt.clientY);

      if(ct) {

        ct.onend(evt, this);
      }
      else {

        //if(this.currentContainer) this.currentContainer.onend( evt, this );
        this.ResetToDragBegin(evt);
      }

      this.currentContainer = null;
      this.callback.onend( );
    }

  }

  _dodrag(evt) {

   if( DRAG_VERBOSE ) console.log( "_dodrag", this.isDrag );
    if(this.isDrag) {
      var ct = this._whichContainer(evt.clientX, evt.clientY);

      let newx = this.oldposX + evt.clientX - this.initialX;
      let newy = this.oldposY + evt.clientY - this.initialY;
      if(this.currentContainer) {
        var exec = this.currentContainer.ondrag(evt, this, this.futureX, this.futureY, newx, newy);
        if(!exec) {
          return;
        }
      }

      if(ct != this.currentContainer) { //Are we leaving the container?
        var exec = true;
        if(this.currentContainer != null) {
          exec = this.currentContainer.onleave(evt, this);
          if( DRAG_VERBOSE > 1 ) console.log( "leave", this.currentContainer, exec );
        }

        if(!exec) {
          return;
        }
        this.currentContainer = ct;
      }

      this.futureX = newx;
      this.futureY = newy;
      this._updatePositionInternal(this.futureX, this.futureY);
    }
  }
}
