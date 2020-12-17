
// Draws optimal circles around groups
// Currently using divs as bubbles and the css top, left, width and height property to resize and position them. 
// We noticed that this is a bit slow, so one improvement would be to use svgs again.
function drawGroupBubblesV2(users) {

  var group_bubbles = new Map();

  // gets all (x,y) coordinates for each bubble
  for (var k in users) {
    var u = users[k];

    u_bubble = u.bubble;

    if (u_bubble == "offline") continue;

    u_coordinates = {x: u.position[0], y: u.position[1]};

    if (group_bubbles.get(u_bubble)) {
    	var arr = group_bubbles.get(u_bubble);
    	arr.push(u_coordinates);
    	group_bubbles.set(u_bubble, arr);
    } else {
    	group_bubbles.set(u_bubble, [u_coordinates]);
    }
  }

  // will store the newly computed circles for all bubbles
  var group_bubble_circles = new Map();

  // getting the optimal circles for each bubble
  for (var bubble of group_bubbles.entries()) {
  	var bubble_id = bubble[0];
  	var bubble_coordinates = bubble[1];

  	// no need to draw a group bubble for a single user
  	if (bubble_coordinates.length < 2) continue;

  	// returns an optimal circle
  	var bubble_circle = makeCircle(bubble_coordinates);
  	
  	group_bubble_circles.set(bubble_id, bubble_circle);
  }

  // drawing the circles

  // first updating existing bubbles (changing coordinates or deleting)
  var existing_group_bubbles_parent = document.getElementById("group_bubble_circles");
  var existing_group_bubbles = existing_group_bubbles_parent.children;



  for (var egb of existing_group_bubbles) {
  	if (group_bubble_circles.has(Number(egb.id))) {
  		// means this group bubble still exists and might need to be updated
  		var new_group_bubble_parameters = group_bubble_circles.get(Number(egb.id));
  		egb.style.left = new_group_bubble_parameters.x + "%"
  		egb.style.top = new_group_bubble_parameters.y + "%"
  		egb.style.width = "calc(" + new_group_bubble_parameters.r * 2 * 0.85 + "vw + 120px)"
  		egb.style.height = "calc(" + new_group_bubble_parameters.r * 2 * 0.85+ "vw + 120px)"

  		group_bubble_circles.delete(Number(egb.id));
  	} else {
  		// means this group bubble doesn't exist anymore and can be deleted
  		egb.remove();
  	}
  }

  // adding bubbles which don't already exist
  for (var gbc of group_bubble_circles.entries()) {

  	var bubble_id = gbc[0]
  	var bubble_parameters = gbc[1]
  	var bubble_x = bubble_parameters.x
  	var bubble_y = bubble_parameters.y
  	var bubble_r = bubble_parameters.r

  	let new_group_bubble = document.createElement("div");
  	new_group_bubble.id = bubble_id;
  	new_group_bubble.classList.add("group_bubble");
  	new_group_bubble.style.left = bubble_x + "%";
  	new_group_bubble.style.top = bubble_y + "%";
  	new_group_bubble.style.width = "calc(" + bubble_r * 2 * 0.85+ "vw + 120px)";
  	new_group_bubble.style.height = "calc(" + bubble_r * 2 * 0.85+ "vw + 120px)";

  	existing_group_bubbles_parent.appendChild(new_group_bubble);

  }
}