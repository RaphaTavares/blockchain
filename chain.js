import { Block } from "./block.js";
import { BlockHeader } from "./block.js";
import moment from "moment";
import sha256 from "crypto-js/sha256.js";
import { Level } from 'level';
import fs from 'fs';
import fileDirName from "./utilities/paths.js";

const { __dirname, __filename } = fileDirName(import.meta);

export default class chain {

    constructor(){
        this.blockchain = [this.getGenesisBlock()];
        this.db;
    }

    getGenesisBlock() {
        let blockHeader = new BlockHeader(1, null, "0x1bc330000000000000000000000000000000000000000", moment().unix());
        return new Block(blockHeader, 0, null);
    }
    
    getLatestBlock(){
        return this.blockchain[this.blockchain.length - 1];
    }    
    
    addBlock(newBlock){
        let previousBlock = this.getLatestBlock();
        if(previousBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === previousBlock.blockHeader.merkleRoot){
            this.blockchain.push(newBlock);
            this.storeBlock(newBlock);
        }
    }
    
    getBlock(index){
        if(this.blockchain.length-1 >= index)
            return this.blockchain[index];
        
        return null;
    }

    generateNextBlock(txns){
        const prevBlock = this.getLatestBlock();
        const prevMerkleRoot = prevBlock.blockHeader.merkleRoot;
        const nextIndex = prevBlock.index + 1;
        const nextTime = moment().unix();
        const nextMerkleRoot = sha256(1, prevMerkleRoot, nextTime).toString();

        const blockHeader = new BlockHeader(1, prevMerkleRoot, nextMerkleRoot, nextTime);
        const newBlock = new Block(blockHeader, nextIndex, txns);
        this.blockchain.push(newBlock);

        this.storeBlock(newBlock);

        return newBlock;
    };

    createDb(peerId){
        let dir = `${__dirname}/db/${peerId}`;
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            this.db = new Level(dir, { valueEncoding: 'json'});
            this.storeBlock(this.getGenesisBlock());
        };
    };

    storeBlock(newBlock){
        this.db.put(newBlock.index, JSON.stringify(newBlock), function (err){
            if(err)
                return console.log("Ooops!", err)

            console.log('--- Inserting block index: ' + newBlock.index);
        });
    };

    getDbBlock(index, res){
        this.db.get(index,function(err, value){
            if(err)
                return res.send(JSON.stringify(err));

            return res.send(value);
        });
    };
}