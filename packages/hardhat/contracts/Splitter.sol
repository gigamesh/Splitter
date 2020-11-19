pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "hardhat/console.sol";

contract Splitter {
    using SafeMath for uint256;

    address public alice;
    address public bob;
    address public carol;
    mapping(address => uint256) public balances;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(address _bob, address _carol) public {
        alice = msg.sender;
        bob = _bob;
        carol = _carol;
        // what should we do on deploy?
    }

    function deposit(bool _split) external payable {
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

    function withdraw(uint256 _amount) external payable {
        require(
            msg.sender == alice || msg.sender == bob || msg.sender == carol,
            "Address not found"
        );
        require(balances[msg.sender] > 0, "You have no balance");

        // console.log(msg.sender, balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        // console.log("_amount:", _amount);

        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed.");

        emit Withdraw(_amount);
    }
}
