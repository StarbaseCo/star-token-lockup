const MintableToken = artifacts.require('MintableToken');
const StarLockup = artifacts.require('./StarLockup');

const { should, ensuresException } = require('./helpers/utils');
const { increaseTimeTo, latestTime, duration } = require('./helpers/timer');

const BigNumber = web3.BigNumber;

contract('StarLockup', function([_, owner, beneficiary]) {
    const amount = new BigNumber(1000);
    let start, token, cliff, length;
    let vesting;

    beforeEach(async () => {
        token = await MintableToken.new({ from: owner });

        start = latestTime() + duration.minutes(1); // +1 minute so it starts after contract instantiation
        cliff = duration.years(1);
        length = duration.years(2);

        vesting = await StarLockup.new(
            beneficiary,
            start,
            cliff,
            length,
            true,
            token.address,
            { from: owner }
        );

        await token.mint(vesting.address, amount, { from: owner });
    });

    it('cannot be released before cliff', async () => {
        try {
            await vesting.release();
            assert.fail();
        } catch (e) {
            ensuresException(e);
        }
    });

    it('can be released after cliff', async () => {
        await increaseTimeTo(start + cliff + duration.weeks(1));
        await vesting.release().should.be.fulfilled;
    });

    it('should release proper amount after cliff', async () => {
        await increaseTimeTo(start + cliff);

        const { receipt } = await vesting.release();
        const releaseTime = web3.eth.getBlock(receipt.blockNumber).timestamp;

        const balance = await token.balanceOf(beneficiary);
        balance.should.bignumber.equal(
            amount
                .mul(releaseTime - start)
                .div(length)
                .floor()
        );
    });

    it('cannot release token twice for the same time period', async () => {
        await increaseTimeTo(start + cliff);

        const { receipt } = await vesting.release();
        const releaseTime = web3.eth.getBlock(receipt.blockNumber).timestamp;

        let balance = await token.balanceOf(beneficiary);
        balance.should.bignumber.equal(
            amount
                .mul(releaseTime - start)
                .div(length)
                .floor()
        );

        // attempt another claim right after first one. All in all token balance must be the same
        try {
            await vesting.release();
            assert.fail();
        } catch (e) {
            ensuresException(e);
        }

        balance = await token.balanceOf(beneficiary);
        balance.should.bignumber.equal(
            amount
                .mul(releaseTime - start)
                .div(length)
                .floor()
        );
    });

    it('should linearly release tokens during vesting period', async () => {
        const vestingPeriod = length - cliff;
        const checkpoints = 4;

        for (let i = 1; i <= checkpoints; i++) {
            const now = start + cliff + i * (vestingPeriod / checkpoints);
            await increaseTimeTo(now);

            await vesting.release();
            const balance = await token.balanceOf(beneficiary);
            const expectedVesting = amount
                .mul(now - start)
                .div(length)
                .floor();

            balance.should.bignumber.equal(expectedVesting);
        }
    });

    it('should have released all after end', async () => {
        await increaseTimeTo(start + length);
        await vesting.release();
        const balance = await token.balanceOf(beneficiary);
        balance.should.bignumber.equal(amount);
    });

    it('should be revoked by owner if revocable is set', async () => {
        await vesting.revoke({ from: owner }).should.be.fulfilled;
    });

    it('should fail to be revoked by owner if revocable not set', async () => {
        const vesting = await StarLockup.new(
            beneficiary,
            start,
            cliff,
            length,
            false,
            token.address,
            { from: owner }
        );

        try {
            await vesting.revoke({ from: owner });
            assert.fail();
        } catch (e) {
            ensuresException(e);
        }
    });

    it('should return the non-vested tokens when revoked by owner', async () => {
        await increaseTimeTo(start + cliff + duration.weeks(12));

        const vested = await vesting.vestedAmount();

        await vesting.revoke({ from: owner });

        const ownerBalance = await token.balanceOf(owner);
        ownerBalance.should.bignumber.equal(amount.sub(vested));
    });

    it('should keep the vested tokens when revoked by owner', async () => {
        await increaseTimeTo(start + cliff + duration.weeks(12));

        const vestedPre = await vesting.vestedAmount();

        await vesting.revoke({ from: owner });

        const vestedPost = await vesting.vestedAmount();

        vestedPre.should.bignumber.equal(vestedPost);
    });

    it('should fail to be revoked a second time', async () => {
        await increaseTimeTo(start + cliff + duration.weeks(12));

        await vesting.vestedAmount();

        await vesting.revoke({ from: owner });

        try {
            await vesting.revoke({ from: owner });
            assert.fail();
        } catch (e) {
            ensuresException(e);
        }
    });
});
