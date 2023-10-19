// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

contract AoWBattle {
    struct Battle {
        address player;
        uint256 playerTokenId;
        uint256 playerHP;
        uint256 enemyHP;
        bool battleInProgress;
        bool winner; //true if player wins
    }

    // Define events
    event Joined(uint256 indexed _battleId);
    event Attacked(
        uint256 indexed _battleId,
        bool _isPlayer,
        uint256 _playerHP,
        uint256 _enemyHP
    );

    // Constants
    uint256 constant MAX_HP = 100;

    // Variables
    uint256 public battleId = 0;
    mapping(uint256 => Battle) public battles;

    function join(uint256 tokenId) external returns (uint256 battleId_) {
        battleId++;
        battleId_ = battleId;
        Battle storage _battle = battles[battleId_];
        require(!_battle.battleInProgress, "Battle already in progress");

        // Set battle variables
        _battle.player = msg.sender;
        _battle.playerTokenId = tokenId;
        _battle.playerHP = MAX_HP;
        _battle.enemyHP = MAX_HP;
        _battle.battleInProgress = true;

        emit Joined(battleId_);
    }

    function attack(uint256 _battleId, uint8 skill) external {
        Battle storage _battle = battles[_battleId];
        require(_battle.battleInProgress, "Battle is not in progress");
        //TODO enum
        require(skill == 1 || skill == 2, "Invalid skill"); // Assuming 1 and 2 are valid skills for simplicity

        uint256 _damage;
        if (skill == 1) {
            _damage = 30;
        } else if (skill == 2) {
            _damage = 60;
        }

        _battle.enemyHP = (_battle.enemyHP > _damage)
            ? _battle.enemyHP - _damage
            : 0;
        emit Attacked(_battleId, true, _battle.playerHP, _battle.enemyHP);

        if (_battle.enemyHP == 0) {
            _battle.winner = true;
            return;
        }

        // Enemy attacks
        uint256 _damage2 = 10; // For example, enemy deals 10 damage
        _battle.playerHP = (_battle.playerHP > _damage2)
            ? _battle.playerHP - _damage2
            : 0;
        emit Attacked(_battleId, false, _battle.playerHP, _battle.enemyHP);

        if (_battle.playerHP == 0) {
            _battle.winner = false;
        }
    }
}
