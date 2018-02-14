const StandardToken = artifacts.require('./StandardToken.sol');
const StarLockup = artifacts.require('./StarLockup.sol');

const dayInSecs = 86400;

const start = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 20; // twenty secs in the future
const cliff = start + dayInSecs * 30; // 30 days
const duration = start + dayInSecs * 360; // 360 days
const revocable = true;

module.exports = function(deployer, network, [owner, beneficiary]) {
    return deployer
        .then(() => {
            return deployer.deploy(StandardToken);
        })
        .then(() => {
            return deployer.deploy(
                StarLockup,
                beneficiary,
                start,
                cliff,
                duration,
                revocable,
                StandardToken.address
            );
        });
};
