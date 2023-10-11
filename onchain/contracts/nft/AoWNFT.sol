// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AoWNFT is ERC721Enumerable, Ownable {
    string constant BASE_URI =
        "https://raw.githubusercontent.com/yamapyblack/AttackOnWallet/main/onchain/contracts/nft/noun.png";

    constructor() ERC721("AoWNFT", "AoWNFT") {}

    function mint(address to) external onlyOwner {
        _mint(to, totalSupply() + 1);
    }

    function bulkMint(address[] memory tos) external onlyOwner {
        for (uint256 i = 0; i < tos.length; i++) {
            _mint(tos[i], totalSupply() + 1);
        }
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireMinted(tokenId);

        return BASE_URI;
    }
}
