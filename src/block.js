const SHA256 = require('crypto-js/sha256');

class Block{
    constructor(timestamp, lastHash, hash, data){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
    }

    toString(){
        return `Block: \n{ \n\ttimestamp : ${this.timestamp} \n\tlastHash: ${this.lastHash.substring(0, 10)} \n\thash : ${this.hash.substring(0, 10)} \n\tdata: ${this.data} \n}`;
    }

    static genesis(){
        return new this('Genesis time', '----------', 'JFKSDC3245DK1', []);
    }

    static mineBlock(lastBlock, data){
        const timestamp = Date.now();
        const lastHash = lastBlock.hash;
        const hash = Block.hash(timestamp, lastHash, data);

        return new this(timestamp, lastHash, hash, data);
    }

    //SHA256 = secure hash algorithm
    //tem 256 bits = 32 bytes = 32 caracteres
    static hash(timestamp, lastHash, data){
        return SHA256(`${timestamp}${lastHash}${data}`).toString();
    }

    static blockHash(block){
        const { timestamp, lastHash, data } = block;
        return Block.hash(timestamp, lastHash, data);
    }
}

module.exports = Block;