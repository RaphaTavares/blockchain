import crypto from 'crypto';
import Swarm from 'discovery-swarm';
import defaults from 'dat-swarm-defaults';
import getPort from 'get-port';
import Chain from "./chain.js";
import { CronJob } from 'cron';
import express from 'express';
import bodyParser from 'body-parser';
import { initWallet } from './wallet.js'

const peers = {};
let connSeq = 0;
let channel = "myBlockchain";
const chain = new Chain();

let registeredMiners = [];
let lastBlockMinedBy = null;

const getRegisteredMiners = () => {
    return registeredMiners;
}

const setRegisteredMiners = (miners) => {
    if(miners !== null && miners !== undefined)
        registeredMiners = miners;
};

let MessageType = {
    REQUEST_LATEST_BLOCK: 'requestLatestBlock',
    LATEST_BLOCK: 'latestBlock',
    RECEIVE_NEW_BLOCK: 'receiveNewBlock',
    REQUEST_ALL_REGISTERED_MINERS: 'requestAllRegisterMiners',
    REGISTER_MINER: 'registerMiner'
};

const myPeerId = crypto.randomBytes(32);
console.log(`myPeerId: ${myPeerId.toString('hex')}`);

const config = defaults({
    id: myPeerId,
});

const swarm = Swarm(config);

chain.createDb(myPeerId.toString('hex'));

let initHttpServer = (port) => {
    let http_port = '80' + port.toString().slice(-2);
    let app = express();
    app.use(bodyParser.json());
    
    app.get('/getBlocks', (req, res) => res.send(JSON.stringify(chain.blockchain)));
    
    app.get('/getBlockByIndex', (req, res) => {
        let blockIndex = req.query.index;
        res.send(chain.blockchain[blockIndex]);
    });

    app.get('/getDbBlockByIndex', (req, res) => {
        let blockIndex = req.query.index;
        chain.getDbBlock(blockIndex, res);
    });

    app.get('/getWallet', (req, res) => {
        res.send(initWallet());
    });

    app.listen(http_port, () => console.log('Listening on port: ' + http_port));
};

(async () => {
    const port = await getPort();

    initHttpServer(port);

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

            switch (message.type) {
                case MessageType.REQUEST_LATEST_BLOCK:
                    console.log('-----------REQUEST_LATEST_BLOCK-------------');
                    let requestedIndex = (JSON.parse(JSON.stringify(message.data))).index;
                    let requestedBlock = chain.getBlock(requestedIndex);
                    if (requestedBlock)
                        writeMessageToPeerToId(peerId.toString('hex'), MessageType.LATEST_BLOCK, requestedBlock);
                    else
                        console.log('No block found @ index: ' + requestedIndex);
                    console.log('-----------REQUEST_LATEST_BLOCK-------------');
                    break;
                case MessageType.LATEST_BLOCK:
                    console.log('-----------LATEST_BLOCK-------------');
                    chain.addBlock(JSON.parse(JSON.stringify(message.data)));
                    console.log(JSON.stringify(chain.blockchain));
                    let nextBlockIndex = chain.getLatestBlock().index+1;
                    console.log('-- request next block @ index: ' + nextBlockIndex);
                    writeMessageToPeers(MessageType.REQUEST_BLOCK, {index: nextBlockIndex});
                    console.log('-----------LATEST_BLOCK-------------');
                    break;
                case MessageType.REQUEST_ALL_REGISTERED_MINERS:
                    console.log('----------- REQUEST_ALL_REGISTERED_MINERS -------------' + message.to);
                    writeMessageToPeers(MessageType.REGISTER_MINER, registeredMiners);
                    setRegisteredMiners(JSON.parse(JSON.stringify(message.data)));
                    console.log('----------- REQUEST_ALL_REGISTERED_MINERS -------------' + message.to);
                    break;
                case MessageType.REGISTER_MINER:
                    console.log('----------- REGISTER_MINER -------------' + message.to);
                    let miners = JSON.stringify(message.data);
                    registeredMiners = JSON.parse(miners);
                    console.log(registeredMiners);
                    console.log('----------- REGISTER_MINER -------------' + message.to);
                    break;
                }
        });

        conn.on('close', () => {
            console.log(`Connection ${seq} closed, peerId: ${peerId}`);
            if(peers[peerId].seq === seq){
                delete peers[peerId];
                console.log('--- registeredMiners before: ' + JSON.stringify(registeredMiners));
                let index = registeredMiners.indexOf(peerId);
                if(index > -1)
                    registeredMiners.splice(index, 1);
                console.log('--- registeredMiners now: ' + JSON.stringify(registeredMiners));
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
};

setTimeout(function(){
    writeMessageToPeers(MessageType.REQUEST_LATEST_BLOCK, {index: chain.getLatestBlock().index+1});
}, 3000);

setTimeout(function(){
    writeMessageToPeers(MessageType.REQUEST_ALL_REGISTERED_MINERS, null)
}, 5000);

setTimeout(function(){
    registeredMiners.push(myPeerId.toString('hex'));
    console.log('------------- Register my miner -------------');
    console.log(registeredMiners);
    writeMessageToPeers(MessageType.REGISTER_MINER, registeredMiners);
}, 7000);


const mineNewBlockJob = new CronJob('30 * * * * *', function(){
    let index = 0;
    if(lastBlockMinedBy){
        let  newIndex = registeredMiners.indexOf(lastBlockMinedBy);
        index = (newIndex + 1 > registeredMiners.length - 1) ? 0 : newIndex + 1;
    }
    lastBlockMinedBy = registeredMiners[index];
    console.log('-- REQUESTING NEW BLOCK FROM: ' + registeredMiners[index] + ', index: ' + index);

    console.log(JSON.stringify(registeredMiners));

    if(registeredMiners[index] === myPeerId.toString('hex')){
        console.log('------------------ create next block -----------------');
        
        let newBlock = chain.generateNextBlock(null);
        chain.addBlock(newBlock);

        console.log(JSON.stringify(newBlock));
        writeMessageToPeers(MessageType.RECEIVE_NEW_BLOCK, newBlock);

        console.log(JSON.stringify(chain.blockchain));
        console.log('----------- create next block -----------');
    }
});

mineNewBlockJob.start();