import crypto from 'crypto';
import Swarm from 'discovery-swarm';
import defaults from 'dat-swarm-defaults';
import getPort from 'get-port';

const peers = {};
let connSeq = 0;
let channel = "myBlockchain";

const myPeerId = crypto.randomBytes(32);
console.log(`myPeerId: ${myPeerId.toString('hex')}`);

const config = defaults({
    id: myPeerId,
});

const swarm = Swarm(config);

(async () => {
    const port = await getPort();

    swarm.listen(port);
    console.log(`Listening port: ${port}`);

    swarm.join(channel);
    swarm.on("connection", (conn, info) => {
        const seq = connSeq;
        const peerId = info.id.toString('hex');
        console.log(`Connected #${seq} to peer: ${peerId}`);

        if(info.initiator){
            try{
                conn.setKeepAlive(true,600);
            } catch(exception){
                console.log("exception", exception);
            }
        };

        conn.on('data', data => {
            let message = JSON.parse(data);
            
            console.log("--------- Received message start ---------");
            console.log("from: " + peerId.toString('hex'),
            'to: ' + peerId.toString(message.to),
            'my: ' + myPeerId.toString('hex'),
            "type: " + JSON.stringify(message.type));
            console.log("--------- Received message end ---------");
        });

        conn.on('close', () => {
            console.log(`Connection ${seq} closed, peerId: ${peerId}`);
            if(peers[peerId].seq === seq){
                delete peers[peerId];
            };
        });

        if(!peers[peerId]){
            peers[peerId] = {};
        };
        peers[peerId].conn = conn;
        peers[peerId].seq = seq;
        connSeq++;
    });
})();

setTimeout(function(){
    writeMessageToPeers('Hello', null);
}, 1000);

const writeMessageToPeers = (type, data) => {
    for(let id in peers){
        console.log("--------- writeMessageToPeers start ---------");
        console.log(`type: ${type}, to: ${id}`);
        console.log("--------- writeMessageToPeers end ---------");
        sendMessage(id, type, data);
    };
};

const writeMessageToPeerToId = (toId, type, data) => {
    for(let id in peers) {
        if(id === toId) {
            console.log("--------- writeMessageToPeerToId start ---------");
            console.log(`type: ${type}, to: ${toId}`);
            console.log("--------- writeMessageToPeerToId end ---------");
            sendMessage(id, type, data);
        };
    };
};

const sendMessage = (id, type, data) => {
    peers[id].conn.write(JSON.stringify(
        {
            to: id,
            from: myPeerId,
            type: type,
            data: data
        }
    ));
}