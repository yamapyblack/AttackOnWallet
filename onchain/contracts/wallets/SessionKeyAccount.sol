// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
/* solhint-disable reason-string */

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import "../core/BaseAccount.sol";
import "./callback/TokenCallbackHandler.sol";
import "../core/Helpers.sol" as Helpers;

/**
 * The account with session key validation.
 *  this is sample minimal account.
 *  has execute, eth handling methods
 *  has a single signer that can send requests through the entryPoint.
 */
contract SessionKeyAccount is
    BaseAccount,
    TokenCallbackHandler,
    UUPSUpgradeable,
    Initializable
{
    using ECDSA for bytes32;

    //--------------Structs--------------
    /**
     * Struct like ValidationData (from the EIP-4337) - alpha solution - to keep track of session keys' data
     * @param validAfter this sessionKey is valid only after this timestamp.
     * @param validUntil this sessionKey is valid only until this timestamp.
     * @param limit limit of uses remaining
     * @param masterSessionKey if set to true, the session key does not have any limitation other than the validity time
     * @param whitelising if set to true, the session key has to follow whitelisting rules
     * @param whitelist - this session key can only interact with the addresses in the whitelist.
     */
    struct SessionKeyStruct {
        uint48 validAfter;
        uint48 validUntil;
        uint48 limit;
        bool masterSessionKey;
        bool whitelising;
        mapping(address => bool) whitelist;
    }

    //--------------Constants--------------
    // bytes4(keccak256("execute(address,uint256,bytes)")
    bytes4 internal constant EXECUTE_SELECTOR = 0xb61d27f6;
    // bytes4(keccak256("executeBatch(address[],uint256[],bytes[])")
    bytes4 internal constant EXECUTEBATCH_SELECTOR = 0x47e1da2a;
    uint48 internal constant DEFAULT_LIMIT = 100;

    //--------------Storages--------------
    address public owner;
    IEntryPoint private immutable _entryPoint;
    mapping(address => SessionKeyStruct) public sessionKeys;

    //--------------Events--------------
    event SessionKeyRegistered(address indexed key);
    event SessionKeyRevoked(address indexed key);
    event AccountInitialized(
        IEntryPoint indexed entryPoint,
        address indexed owner
    );

    //--------------Errors--------------
    error NotOwnerOrEntrypointOrSelf();

    //--------------Modifiers--------------
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    //--------------Constructor--------------
    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    //--------------View Functions--------------
    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    ///@notice check current account deposit in the entryPoint
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    function _onlyOwner() internal view {
        //directly from EOA owner, or through the account itself (which gets redirected through execute())
        require(
            msg.sender == owner || msg.sender == address(this),
            "only owner"
        );
    }

    // Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        require(
            msg.sender == address(entryPoint()) || msg.sender == owner,
            "account: not Owner or EntryPoint"
        );
    }

    ///@notice Require the function call went through EntryPoint, owner or self
    function _requireFromEntryPointOrOwnerorSelf() internal view {
        if (
            msg.sender != address(entryPoint()) &&
            msg.sender != owner &&
            msg.sender != address(this)
        ) {
            revert NotOwnerOrEntrypointOrSelf();
        }
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override {
        (newImplementation);
        _onlyOwner();
    }

    //--------------Write Functions--------------

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        _call(dest, value, func);
    }

    /**
     * execute a sequence of transactions
     */
    function executeBatch(
        address[] calldata dest,
        bytes[] calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], 0, func[i]);
        }
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /**
     * @dev The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
     * a new implementation of SessionKeyAccount must be deployed with the new EntryPoint address, then upgrading
     * the implementation by calling `upgradeTo()`
     */
    function initialize(address anOwner) public virtual initializer {
        _initialize(anOwner);
    }

    function _initialize(address anOwner) internal virtual {
        owner = anOwner;
        emit AccountInitialized(_entryPoint, owner);
    }

    /**
     * deposit more funds for this account in the entryPoint
     */
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /**
     * withdraw value from the account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(
        address payable withdrawAddress,
        uint256 amount
    ) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    /**
     * @inheritdoc BaseAccount
     */
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address signer = hash.recover(userOp.signature);

        // If the userOp was signed by the owner, allow straightaway
        if (owner == signer) {
            return 0;
        }

        // Check if the session key is valid according to the data in the userOp
        if (isValidSessionKey(signer, userOp.callData)) {
            return
                Helpers._packValidationData(
                    false,
                    sessionKeys[signer].validUntil,
                    sessionKeys[signer].validAfter
                );
        }

        return SIG_VALIDATION_FAILED;
    }

    /*
     * @notice Return whether a sessionKey is valid.
     */
    function isValidSessionKey(
        address _sessionKey,
        bytes calldata callData
    ) public returns (bool) {
        SessionKeyStruct storage sessionKey = sessionKeys[_sessionKey];
        // If the signer is a session key that is still valid
        if (sessionKey.validUntil == 0) {
            return false;
        } // Not owner or session key revoked

        // Let's first get the selector of the function that the caller is using
        bytes4 funcSelector = callData[0] |
            (bytes4(callData[1]) >> 8) |
            (bytes4(callData[2]) >> 16) |
            (bytes4(callData[3]) >> 24);

        if (funcSelector == EXECUTE_SELECTOR) {
            if (sessionKey.limit == 0) {
                return false;
            } // Limit of transactions per sessionKey reached
            unchecked {
                sessionKey.limit = sessionKey.limit - 1;
            }

            // Check if it is a masterSessionKey
            if (sessionKey.masterSessionKey) {
                return true;
            }

            // If it is not a masterSessionKey, let's check for whitelisting and reentrancy
            address toContract;
            (toContract, , ) = abi.decode(
                callData[4:],
                (address, uint256, bytes)
            );
            if (toContract == address(this)) {
                return false;
            } // Only masterSessionKey can reenter

            // If there is no whitelist or there is, but the target is whitelisted, return true
            if (!sessionKey.whitelising || sessionKey.whitelist[toContract]) {
                return true;
            }

            return false; // All other cases, deny
        } else if (funcSelector == EXECUTEBATCH_SELECTOR) {
            (address[] memory toContracts, , ) = abi.decode(
                callData[4:],
                (address[], uint256[], bytes[])
            );
            if (
                sessionKey.limit < toContracts.length || toContracts.length > 9
            ) {
                return false;
            } // Limit of transactions per sessionKey reached
            unchecked {
                sessionKey.limit =
                    sessionKey.limit -
                    uint48(toContracts.length);
            }

            // Check if it is a masterSessionKey
            if (sessionKey.masterSessionKey) {
                return true;
            }

            for (uint256 i = 0; i < toContracts.length; ) {
                if (toContracts[i] == address(this)) {
                    return false;
                } // Only masterSessionKey can reenter
                if (
                    sessionKey.whitelising &&
                    !sessionKey.whitelist[toContracts[i]]
                ) {
                    return false;
                } // One contract's not in the sessionKey's whitelist (if any)
                unchecked {
                    ++i; // gas optimization
                }
            }
            return true;
        }

        // If a session key is used for other functions other than execute() or executeBatch(), deny
        return false;
    }

    ///@notice refer _registerSessionKeyWithWhitelist
    function registerSessionKey(
        address _key,
        uint48 _validAfter,
        uint48 _validUntil
    ) public {
        _registerSessionKey(_key, _validAfter, _validUntil, DEFAULT_LIMIT);
        sessionKeys[_key].masterSessionKey = true;
    }

    ///@notice refer _registerSessionKeyWithWhitelist
    function registerSessionKey(
        address _key,
        uint48 _validAfter,
        uint48 _validUntil,
        uint48 _limit
    ) external {
        _registerSessionKey(_key, _validAfter, _validUntil, _limit);
    }

    ///@notice refer _registerSessionKeyWithWhitelist
    function _registerSessionKey(
        address _key,
        uint48 _validAfter,
        uint48 _validUntil,
        uint48 _limit
    ) internal {
        _requireFromEntryPointOrOwnerorSelf();
        sessionKeys[_key].validAfter = _validAfter;
        sessionKeys[_key].validUntil = _validUntil;
        sessionKeys[_key].limit = _limit;
        sessionKeys[_key].masterSessionKey = false;
        sessionKeys[_key].whitelising = false;
        emit SessionKeyRegistered(_key);
    }

    ///@notice refer _registerSessionKeyWithWhitelist
    function registerSessionKey(
        address _key,
        uint48 _validAfter,
        uint48 _validUntil,
        address[] calldata _whitelist
    ) external {
        _registerSessionKeyWithWhitelist(
            _key,
            _validAfter,
            _validUntil,
            DEFAULT_LIMIT,
            _whitelist
        );
    }

    ///@notice refer _registerSessionKeyWithWhitelist
    function registerSessionKey(
        address _key,
        uint48 _validAfter,
        uint48 _validUntil,
        uint48 _limit,
        address[] calldata _whitelist
    ) external {
        _registerSessionKeyWithWhitelist(
            _key,
            _validAfter,
            _validUntil,
            _limit,
            _whitelist
        );
    }

    /**
     * Register a session key to the account
     * @param _key session key to register
     * @param _validAfter - this session key is valid only after this timestamp.
     * @param _validUntil - this session key is valid only up to this timestamp.
     * @param _limit - limit of uses remaining.
     * @param _whitelist - this session key can only interact with the addresses in the _whitelist.
     */
    function _registerSessionKeyWithWhitelist(
        address _key,
        uint48 _validAfter,
        uint48 _validUntil,
        uint48 _limit,
        address[] calldata _whitelist
    ) internal {
        _requireFromEntryPointOrOwnerorSelf();

        // Not sure why changing this for a custom error increases gas dramatically
        require(_whitelist.length < 11, "Whitelist too big");
        for (uint256 i = 0; i < _whitelist.length; ) {
            sessionKeys[_key].whitelist[_whitelist[i]] = true;
            unchecked {
                ++i; // gas optimization
            }
        }

        sessionKeys[_key].validAfter = _validAfter;
        sessionKeys[_key].validUntil = _validUntil;
        sessionKeys[_key].limit = _limit;
        sessionKeys[_key].masterSessionKey = false;
        sessionKeys[_key].whitelising = true;

        emit SessionKeyRegistered(_key);
    }

    /**
     * Revoke a session key from the account
     * @param _key session key to revoke
     */
    function revokeSessionKey(address _key) external {
        _requireFromEntryPointOrOwnerorSelf();
        if (sessionKeys[_key].validUntil != 0) {
            sessionKeys[_key].validUntil = 0;
            emit SessionKeyRevoked(_key);
        }
    }
}
