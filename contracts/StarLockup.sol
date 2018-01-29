pragma solidity 0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract StarLockup {
    uint256 public startTokenReleaseAt;
    uint256 public endTokenReleaseAt;
    address public beneficiary;
    address public allocator;
    uint256 public lastTokensClaimedAt;

    StandardToken public star;

    /**
     * @dev contract constructor
     * @param _startTokenReleaseAt Beneficiary can start claiming tokens partially
     * @param _endTokenReleaseAt Beneficiary is able to claim all tokens
     * @param _beneficiary Beneficiary address
     * @param tokenAddress ERC20 token address
     */
    function StarLockup
    (
        uint256 _startTokenReleaseAt,
        uint256 _endTokenReleaseAt,
        address _beneficiary,
        address tokenAddress
    )
        public
    {
        require(
            _startTokenReleaseAt >= now &&
            _endTokenReleaseAt > _startTokenReleaseAt &&
            _beneficiary != address(0) &&
            tokenAddress != address(0)
        );

        startTokenReleaseAt = _startTokenReleaseAt;
        endTokenReleaseAt = _endTokenReleaseAt;
        beneficiary = _beneficiary;
        allocator = msg.sender;

        star = StandardToken(tokenAddress);
    }

    function claimTokens() public {
        require(msg.sender == beneficiary && now >= startTokenReleaseAt);

        uint256 tokenAmount = star.balanceOf(this);
        uint256 numberOfSecondsElapsed = lastTokensClaimedAt - startTokenReleaseAt;
        uint256 claimableStarBalance = numberOfSecondsElapsed * (tokenAmount / endTokenReleaseAt);

        lastTokensClaimedAt = now;

        return releaseTokens(beneficiary, claimableStarBalance);
    }

    function releaseTokens(address receiver, uint256 amount) internal {
        require(star.transfer(receiver, amount));
    }
}
