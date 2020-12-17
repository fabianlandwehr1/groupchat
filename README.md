# How to start the servers

## How to run this

We have to run multiple processes at the same time. To do that, we can use tmux. We first create two new tmux sessions:

```
$ tmux new -s node-server
$ tmux new -s peerjs-server
```

To attach a session, type 

```
$ tmux attach -t SESSIONNAME
```

To detach from a session, type `ctrl-b d`.

### Start the nodejs server

This application was built with nodejs v10.23.0. Make sure you have a similar version installed. 

To start the nodejs server, attach to the tmux session:

```
tmux attach -t node-server
```

Then to actually start it, type

```
$ sudo node server.js
```

After that you can deattach with `ctrl-b d`.

### Start peerjs server

To install the peerjs server, type the following into the console:

```$ npm i peer -g```

After doing that, you should be able to start the peerjs server. It is important that the certificates are properly set up. If they are not, the connection to the peerjs server will silently fail. 

Attach to the peer-js tmux session, then type:

```$ peerjs --port 9000 --key peerjs --sslkey private.key --sslcert certificate.crt --path /hci_app --sslca ca_bundle.crt```

After that, again deattach from the tmux session.