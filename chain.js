let Block = require("./block.js").Block;
let BlockHeader = require("./block.js").BlockHeader;
let moment = require("moment");

const blockchain = [getGenesisBlock()];

let getGenesisBlock = () => {
    let blockHeader = new BlockHeader(1, null, "0x1bc330000000000000000000000000000000000000000", moment().unix());
    return new Block(blockHeader, 0, null);
}

let getLatestBlock = () => blockchain[blockchain.length - 1];

let addBlock = (newBlock) => {
    let previousBlock = getLatestBlock();
    if(previousBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === previousBlock.blockHeader.merkleRoot){
        blockchain.push(newBlock);
    }
};

let getBlock = (index) => {
    if(blockchain.length-1 >= index)
        return blockchain[index];
    
    return null;
}

if(typeof exports != 'undefined'){
    exports.addBlock = addBlock;
    exports.getBlock = getBlock;
    exports.blockchain = blockchain;
    exports.getLatestBlock = getLatestBlock;
};