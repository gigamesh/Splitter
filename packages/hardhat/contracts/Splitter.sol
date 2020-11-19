pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Splitter {
    using SafeMath for uint256;

    address public alice;
    address public bob;
    address public carol;
    mapping(address => uint256) public balances;

    event Deposit(uint256 amount);

    constructor(address _bob, address _carol) public {
        alice = msg.sender;
        bob = _bob;
        carol = _carol;
        // what should we do on deploy?
    }

    function deposit(bool _split) public payable {
        require(msg.sender == alice, "You lack deposit permission");

        if (_split) {
            uint256 val = msg.value.div(2);
            balances[bob] = balances[bob].add(val);
            balances[carol] = balances[carol].add(val);
        } else {
            balances[alice] = balances[alice].add(msg.value);
        }

        emit Deposit(msg.value);
    }
}
