module.exports = {

	algo : bubbleAlgoPrivate
}

function CONFIG( ) {

	return { distance : 25 };
}

//takes vectors x,y \in \R^n for current positions and b \in \N as last bubble assignment, returns resulting graph and new bubble assignment b_prime.
//order matters. ensures somewhat minimal number of connection changes
function bubbleAlgoPrivate( xs, ys, b = range( xs.length )) {

	const n = xs.length;
	var G = { V : range( n ), E : Array( n ).fill( 0 ).map( x => Array( n ).fill( 0 ))};
	const E = G.E;

	for( var i = 0; i < n; ++ i ) {
		for( var j = 0; j < n; ++ j ) {

			if( i != j && isCloserThan( CONFIG( ).distance, xs[ i ], ys[ i ], xs[ j ], ys[ j ])) {

				E[ i ][ j ] = 1;
				E[ j ][ i ] = 1;
			}
		}
	}

	function traverse(Edges, visited, ids, id, at) {
		visited[at] = true;
		ids[at] = id;
		for(i = 0; i < n; i++) {
			if(Edges[at][i] == 1 && !visited[i]) {
				traverse(Edges, visited, ids, id, i);
			}
		}
	}

	let visited = new Array(n);
	let ids = new Array(n);
	let currentId = 0;
	visited.fill(false);

	for(j = 0; j < n; j++) {
		if(!visited[j]) {
			traverse(E, visited, ids, currentId, j);
			currentId = currentId + 1;
		}
	}

	let groups = {};
	for(j = 0; j < n; j++) {
		if(groups[ids[j]] != null) {
			groups[ids[j]].push(j);
		}
		else {
			groups[ids[j]] = [j];
		}
	}

	for(group in Object.values(groups)) {
		for(x in group) {
			for(y in group) {
				E[x][y] = 1;
			}
		}
	}

/*
	var changed = true;

	while( changed ) {

		changed = false;
		var updates = [ ];

		for( var i = 0; i < n; ++ i ) {
			for( var j = 0; j < n; ++ j ) {

				if( i != j && E[ i ][ j ] == 1 ) {

					for( var k = 0; k < n; ++ k ) {

						if( E[ j ][ k ] == 1 && k != i && j != k && E[ i ][ k ] == 0 ) {

							changed = true;
							updates.push({ u : i, v : k });
						}
					}
				}
			}
		}

		updates.forEach((item, index) => {
      E[ item.u ][ item.v ] = 1;
      E[ item.v ][ item.u ] = 1;
    });
	}
*/


	var b_prime = range( n ).map( i => b[ i ]);
	//if disconnected users argue about the bubble id, the more popular one gets to keep it
	for( var i = 0; i < n; ++ i ) {
		for( var j = 0; j < n; ++ j ) {

			if( i != j && E[ i ][ j ] == 0 && b_prime[ i ] == b_prime[ j ] ) {

				const deg_i = degree( i, G );
				const deg_j = degree( j, G );
				const looser = deg_i < deg_j || ( deg_i == deg_j && i > j ) ? i : j;
				const new_bubble_id = Math.max( ...b_prime ) + 1;
				b_prime[ looser ] = new_bubble_id;
			}
		}
	}

	//if connected users have different bubble ids, the more common id is kept
	for( var i = 0; i < n; ++ i ) {
		for( var j = 0; j < n; ++ j ) {

			if( E[ i ][ j ] == 1 && b_prime[ i ] != b_prime[ j ]) {

				const count_i = count( b_prime[ i ], b_prime );
				const count_j = count( b_prime[ j ], b_prime )
				const winner_id = count_i > count_j || ( count_i == count_j && b_prime[ i ] < b_prime[ j ]) ? b_prime[ i ] : b_prime[ j ];
				b_prime[ i ] = b_prime[ j ] = winner_id;
			}
		}
	}

	return { graph: G, bubbles: b_prime };
}

function isCloserThan( distance, x1, y1, x2, y2 ) {

  return distance >= Math.sqrt( Math.pow( x1 - x2, 2 ) + Math.pow( y1 - y2, 2 ));
}

function range( n ) {

	return [ ...Array( n ).keys( ) ];
}

function degree( v, G ) {

	var c = 0;
	for( var j = 0; j < G.V.length; ++ j ) {

		if( G.E[ v ][ j ] && j != v ) c+=1;
	}

	return c;
}

function count( x, xs ) {

	var c = 0;
	xs.forEach( y => { if( y == x ) c += 1; });
	return c;
}
