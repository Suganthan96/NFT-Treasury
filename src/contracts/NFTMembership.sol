// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JoinNow {
    event Joined(address indexed user, uint256 amount);
    mapping(address => bool) public hasMembership;

    function joinNow() external payable {
        // Accept any amount (but track membership)
        if (msg.value > 0) {
            hasMembership[msg.sender] = true;
        }
        emit Joined(msg.sender, msg.value);
    }

}