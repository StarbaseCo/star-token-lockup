const StandardToken = artifacts.require('./StandardToken');
const StarLockup = artifacts.require('./StarLockup');

const { should, ensuresException, getBlockNow } = require('./helpers/utils');

contract('StarLockup', ([allocator, beneficiary]) => {
  let starLockup, token;

  let startTokenReleaseAt, endTokenReleaseAt;

  const dayInSecs = 86400;

  beforeEach('setup contract', async () => {
    startTokenReleaseAt = getBlockNow() + dayInSecs * 365;
    endTokenReleaseAt = startTokenReleaseAt + dayInSecs * 365;

    token = await StandardToken.new();

    console.log({
      startTokenReleaseAt,
      endTokenReleaseAt,
      beneficiary,
      token: token.address
    });
    starLockup = await StarLockup.new(
      startTokenReleaseAt,
      endTokenReleaseAt,
      beneficiary,
      token.address
    );
  });

  describe('contract migration parameters', () => {
    it('has a startTokenReleaseAt', async () => {
      const contractLockUpPeriod = await starLockup.startTokenReleaseAt();
      contractLockUpPeriod.should.be.bignumber.equal(startTokenReleaseAt);
    });

    it('has a beneficiary');

    it('has a allocator');
    it('references StandardToken');
  });

  describe('claim tokens', () => {
    describe('before lockup period', () => {
      describe('as a beneficiary', () => {
        it('is NOT able to claim tokens');
      });

      describe('as a allocator', () => {
        it('is able to cancel contract');
        it('is able to claim all vested tokens');
      });
    });

    describe('after lock up period', () => {
      describe('as a beneficiary', () => {
        it('is able to claim unvested tokens');
        it(
          'should be able to claim their unvested tokens even if contract is cancelled'
        );
        it('cannot claim the same unvested tokens again');
      });

      describe('as a allocator', () => {
        it('is able to cancel contract');
        it('can only retrieve vested tokens past the point of cancellation');
      });
    });
  });

  describe('extra contract functionalities', () => {
    it('does not lock or accept ether');
  });
});
