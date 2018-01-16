pragma solidity 0.4.18;

import './StarbaseToken.sol';
/* The time lock is better to be flexible (variable set in the contract)
Can be set for one 1 year lockup and 1/52 per week after 1 year.

And have a cancel condition.
If an allocatee quit the company(or some another issue) before certain date, allocator is able to cancel the allocation. */

/* it('cannot realease token before the unlockedAt ends');
it('does not lock or accept ether');
it('releases token funds after unlockedAt');
it(
    'allows allocator to cancel the release of the tokens before the unlockedAt is over'
); */

contract StarLockup {
    uint256 public unlockedAt;
    uint256 public gradualReleasePeriod;
    address public beneficiary;
    address public allocator;
    uint256 public lastTokenRelease;

    StarbaseToken public star;

    function StarLockup
    (
        uint256 _unlockedAt,
        uint256 _gradualReleasePeriod,
        address _beneficiary,
        address token
    )
        public
    {
        require(
            beneficiary != address(0) &&
            token != address(0) &&
            unlockedAt > now &&
            _gradualReleasePeriod != 0
        );

        unlockedAt = _unlockedAt;
        gradualReleasePeriod = _gradualReleasePeriod;
        beneficiary = _beneficiary;
        allocator = msg.sender;

        star = StarbaseToken(token);
    }

    function cancelContract() public {
        require(msg.sender == allocator);

        uint256 starBalance = star.balanceOf(this);
        releaseTokens(allocator, starBalance);

        selfdestruct();
    }

    function claimTokens() public {
        require(msg.sender == beneficiary && now >= unlockedAt);

        if (now > unlockedAt) {
            if (!lastTokenRelease)
                lastTokenRelease = now;

            uint256 tokenAmount = star.balanceOf(this);
            uint256 numberOfSecondsElapsed = lastTokenRelease - unlockedAt; // seconds passed after lastTokenRelease
            uint256 claimableStarBalance = numberOfSecondsElapsed * (tokenAmount / gradualReleasePeriod)

            return releaseTokens(beneficiary, claimableStarBalance);
        }

        releaseTokens(beneficiary);
    }

    function releaseTokens(address receiver, uint256 amount) internal {
        require(star.transfer(receiver, amount));
    }
}
