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

})