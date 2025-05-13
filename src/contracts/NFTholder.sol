// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

contract ERC721Checker {
    address public immutable nftAddress;

    constructor(address _nftAddress) {
        nftAddress = _nftAddress;
    }

    function getERC721Balance(address wallet) external view returns (uint256) {
        return IERC721(nftAddress).balanceOf(wallet);
    }
}
