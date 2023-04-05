import { Block } from "./block.js";
import { BlockHeader } from "./block.js";
import moment from "moment";

export default class chain {
    constructor(){
        this.blockchain = [this.getGenesisBlock()];
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
        }
    }
    
    getBlock(index){
        if(this.blockchain.length-1 >= index)
            return this.blockchain[index];
        
        return null;
    }
}