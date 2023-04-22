import pkg from 'elliptic';
const { ec: EC } = pkg;
import fs from 'fs';
import fileDirName from "./utilities/paths.js";

const { __dirname, __filename } = fileDirName(import.meta);

const ec = new EC('secp256k1');
const privateKeyLocation = __dirname + '/wallet/private_key';

export const initWallet = () => {
    let privateKey;

    if(fs.existsSync(privateKeyLocation)){
        const buffer = fs.readFileSync(privateKeyLocation, 'utf8');
        privateKey = buffer.toString();
    } 
    else{
        privateKey = generatePrivateKey();
        fs.writeFileSync(privateKeyLocation, privateKey);
    }

    const key = ec.keyFromPrivate(privateKey, 'hex');
    const publicKey = key.getPublic().encode('hex');

    return({'privateKeyLocation': privateKeyLocation,
            'publicKey': publicKey});
};

const generatePrivateKey = () => {
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
}


// Test
/*
let retVal = iniWallet();
console.log(JSON.stringify(retVal));
*/