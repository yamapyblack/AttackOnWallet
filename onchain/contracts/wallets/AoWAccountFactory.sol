// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;
import {SessionKeyAccountFactory, SessionKeyAccount, IEntryPoint} from "./SessionKeyAccountFactory.sol";

interface Mintable {
    function mint(address to) external;
}

interface Joinable {
    function join(uint256 tokenId) external returns (uint256 battleId_);
}

contract AoWAccountFactory is SessionKeyAccountFactory {
    address public immutable nft;
    address public immutable battle;

    constructor(
        IEntryPoint _entryPoint,
        address _nft,
        address _battle
    ) SessionKeyAccountFactory(_entryPoint) {
        nft = _nft;
        battle = _battle;
    }

    function createAccount(
        address owner,
        uint256 salt
    ) public payable override returns (SessionKeyAccount ret) {
        ret = super.createAccount(owner, salt);

        //initial gas depoist
        if (msg.value > 0) {
            payable(address(ret)).transfer(msg.value);
        }

        //mint nft
        Mintable(nft).mint(address(ret));
        Joinable(battle).join(1);
    }
}
