# How to start the servers

## application (?) server

``$ sudo node server.js``

## peerjs server

`$ peerjs --port 9000 --key peerjs --sslkey private.key --sslcert certificate.crt --path /hci_app --sslca ca_bundle.crt`

## How to use tmux

In order to let the processes continue once the ssh session is over, we can use tmux to start the processes and then detach from the sessions.

### To start a process

`$ tmux` and then start the process (i.e. `$ node server.js`). Now type `ctrl-b d` to detach the session.

### To end a process

`$ tmux ls` to see all sessions. Then `$ tmux attach -t 0` and replace 0 with the session number you need. Then just stop the process and detach again.