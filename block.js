exports.BlockHeader = class BlockHeader {
    constructor(version, previousBlockHeader, merkleRoot, time)
    {
        this.version = version;
        this.previousBlockHeader = previousBlockHeader;
        this.merkleRoot = merkleRoot;
        this.time = time;
    };
};

exports.Block = class Block {
    constructor(blockHeader, index, txns)
    {
        this.blockHeader = blockHeader;
        this.index = index;
        this.txns = txns;
    }
}