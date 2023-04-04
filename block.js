export class BlockHeader {
    constructor(version, previousBlockHeader, merkleRoot, time)
    {
        this.version = version;
        this.previousBlockHeader = previousBlockHeader;
        this.merkleRoot = merkleRoot;
        this.time = time;
    };
};

export class Block {
    constructor(blockHeader, index, txns)
    {
        this.blockHeader = blockHeader;
        this.index = index;
        this.txns = txns;
    }
}