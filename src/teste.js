const Block = require('./block.js');

const block = new Block('7657', '3029UN43405N', '3904ASLV45M62', '100');

console.log(block.toString());
console.log(Block.genesis().toString());

const primeiroBloco = Block.mineBlock(Block.genesis(), '$500');
console.log(primeiroBloco.toString());