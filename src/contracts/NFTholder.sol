// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

contract ERC721Checker {
    function getERC721Balance(address nftAddress, address wallet) external view returns (uint256) {
        return IERC721(nftAddress).balanceOf(wallet);
    }
}
