const StarbaseToken = artifacts.require('./StarbaseToken');
const StarLockup = artifacts.require('./StarLockup');

/* The time lock is better to be flexible (variable set in the contract)
Can be set for one 1 year lockup
 and 1/52 per week after 1 year.

And have a cancel condition.
If an allocatee quit the company(or some another issue) before certain date, allocator is able to cancel the allocation. */

contract('StarLockup', () => {
    describe('contract migration parameters', () => {
        it('has a lockupPeriod');
        it('has a beneficiary');
        it('has a allocator');
        it('references StarbaseToken');
    });

    it('cannot realease token before the lockupPeriod ends');
    it('does not lock or accept ether');
    it('releases token funds after lockupPeriod');
    it(
        'allows allocator to cancel the release of the tokens before the lockupPeriod is over'
    );
    it();
});
