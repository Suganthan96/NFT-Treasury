// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JoinNow {
    event Joined(address indexed user, uint256 amount);
    mapping(address => bool) public hasMembership;

    // This function is called when someone sends ETH directly (no data)
    receive() external payable {
        if (msg.value > 0) {
            hasMembership[msg.sender] = true;
            emit Joined(msg.sender, msg.value);
        }
    }

    // Optional: fallback to catch other calls
    fallback() external payable {
        if (msg.value > 0) {
            hasMembership[msg.sender] = true;
            emit Joined(msg.sender, msg.value);
        }
    }

    // Optional: keep original function for function-call-based payments
    function joinNow() external payable {
        if (msg.value > 0) {
            hasMembership[msg.sender] = true;
            emit Joined(msg.sender, msg.value);
        }
    }
}
