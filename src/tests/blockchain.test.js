const Blockchain = require('../blockchain');
const Block = require('../block');

describe('Blockchain', () => {

    let bc;
    let bc2;

    beforeEach(() => {
        bc = new Blockchain;
        bc2 = new Blockchain;
    });


    it('starts with genesis block', () => {
        expect(bc.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block', () => {
        const data = 'arquivo.pdf';
        bc.addBlock(data);
        
        expect(bc.chain[bc.chain.length -1].data).toEqual(data);
    });

    it('validates a valid chain', () => {
        bc2.addBlock('500USD');

        expect(Blockchain.isValidChain(bc2.chain)).toBe(true);
    });

    it('invalidates a chain with a corrupt genesis block', () => {
        bc2.chain[0].data = '0USD';

        expect(Blockchain.isValidChain(bc2.chain)).toBe(false);
    });

    it('invalidates a chain with a corrupt block', () => {
        bc2.addBlock('200USD');
        bc2.chain[bc2.chain.length - 1].data = '0USD';

        expect(Blockchain.isValidChain(bc2.chain)).toBe(false);
    });

    it('replaces the chain with a valid new chain', () => {
        bc2.addBlock('650USD');
        bc.replaceChain(bc2.chain);

        expect(bc.chain).toEqual(bc2.chain);
    });

    it('does not replace the chain with a smaller or same sized new chain', () => {
        bc2.addBlock('325USD');

        bc2.replaceChain(bc.chain);

        expect(bc2.chain).not.toEqual(bc.chain);
    });
})