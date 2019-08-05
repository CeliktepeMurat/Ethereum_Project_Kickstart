const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000'});

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    });
    const addresses = await factory.methods.getDeployedCampaing().call();
    campaignAddress = addresses[0];
    
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe('Campaigns', () => {
    it('deploys a factory and campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('can donate and be a approver', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: '150'
        });

        approver = await campaign.methods.approvers(accounts[1]).call();        
        assert(approver);
    });

    it('requires a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: 0
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('allows a manager to make a payment request', async () => {
        await campaign.methods.createRequest('for testing', '100', accounts[1]).send({
            from: accounts[0],
            gas: '1000000'
        });

        const request = await campaign.methods.requests(0).call();
        assert.equal(request.recipient, accounts[1]);
    });

    it('processes request', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: 500
        });

        await campaign.methods.createRequest('for testing', '100', accounts[2]).send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.approveRequest(0).send({
            from: accounts[1],
            gas: 1000000
        });

        const transaction = await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: 1000000
        });

        const request = await campaign.methods.requests(0).call();
        
        assert.ok(transaction.transactionHash);
        assert.equal(request.recipient, accounts[2]);
        
    });
});


