pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


/**
 * @title STAR Lockup vesting mechanism
 * @dev Release STAR  token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
 * owner.
 * modified from zeppelin-solidity/contracts/token/ERC20/TokenVesting.sol
 */
contract StarLockup is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for StandardToken;

    event Released(uint256 amount);
    event Revoked();

    address public beneficiary;

    uint256 public cliff;
    uint256 public start;
    uint256 public duration;

    bool public revocable;

    mapping (address => uint256) public released;
    mapping (address => bool) public revoked;

    StandardToken public star;

    /**
     * @dev Creates a vesting contract that vests its balance of STAR token for a beneficiary
     * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
     * @param _start timestamp representing the beginning of the token vesting process
     * @param _cliff duration in seconds of the cliff in which tokens will begin to vest
     * @param _duration duration in seconds of the period in which the tokens will vest
     * @param _revocable whether the vesting is revocable or not
     * @param _token STAR token address
     */
    function StarLockup
    (
        address _beneficiary,
        uint256 _start,
        uint256 _cliff,
        uint256 _duration,
        bool _revocable,
        address _token
    )
        public
    {
        require(_beneficiary != address(0) && _token != address(0));
        require(_cliff <= _duration);

        beneficiary = _beneficiary;
        revocable = _revocable;
        duration = _duration;
        cliff = _start.add(_cliff);
        start = _start;

        star = StandardToken(_token);
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     */
    function release() public {
        uint256 unreleased = releasableAmount();

        require(unreleased > 0);

        released[star] = released[star].add(unreleased);

        star.safeTransfer(beneficiary, unreleased);

        Released(unreleased);
    }

    /**
     * @notice Allows the owner to revoke the vesting. Tokens already vested
     * remain in the contract, the rest are returned to the owner.
     */
    function revoke() public onlyOwner {
        require(revocable);
        require(!revoked[star]);

        uint256 balance = star.balanceOf(this);

        uint256 unreleased = releasableAmount();
        uint256 refund = balance.sub(unreleased);

        revoked[star] = true;

        star.safeTransfer(owner, refund);

        Revoked();
    }

    /**
     * @dev Calculates the amount that has already vested but hasn't been released yet.
     */
    function releasableAmount() public view returns (uint256) {
        return vestedAmount().sub(released[star]);
    }

    /**
     * @dev Calculates the amount that has already vested.
     */
    function vestedAmount() public view returns (uint256) {
        uint256 currentBalance = star.balanceOf(this);
        uint256 totalBalance =   currentBalance.add(released[star]);

        if (now < cliff) {
            return 0;
        } else if (now >= start.add(duration) || revoked[star]) {
            return totalBalance;
        } else {
            return totalBalance.mul(now.sub(start)).div(duration);
        }
    }
}
