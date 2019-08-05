const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('../ethereum/build/CampaignFactory.json');

const provider = new HDWalletProvider(
    'blood host fox off save movie powder olive bulb among alter mesh',
    'https://rinkeby.infura.io/d8fa408283cb4ea9a89f4f8ca9550ce6'
);

const web3 = new Web3(provider);

const deploy = async () => {

    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from Account ', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ gas: '1000000', from: accounts[0] });

    console.log('Contract deployed to ', result.options.address);    
};

deploy();