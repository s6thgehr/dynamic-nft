// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Chainlink Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
// This import includes functions from both ./KeeperBase.sol and
// ./interfaces/KeeperCompatibleInterface.sol
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

// Dev imports. This only works on a local dev network
// and will not work on any test or main livenets.
// import "hardhat/console.sol";

error BullBear__UpkeepNotNeeded();

contract BullBear is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable,
    KeeperCompatibleInterface
{
    event TokensUpdated(string marketTrend);

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 private immutable i_interval;
    uint256 private s_lastTimestamp;
    int256 private s_lastPrice;
    AggregatorV3Interface private immutable i_priceFeed;

    // IPFS URIs for the dynamic nft graphics/metadata.
    // NOTE: These connect to my IPFS Companion node.
    // You should upload the contents of the /ipfs folder to your own node for development.
    string[] bullUrisIpfs = [
        "https://ipfs.io/ipfs/QmRXyfi3oNZCubDxiVFre3kLZ8XeGt6pQsnAQRZ7akhSNs?filename=gamer_bull.json",
        "https://ipfs.io/ipfs/QmRJVFeMrtYS2CUVUM2cHJpBV5aX2xurpnsfZxLTTQbiD3?filename=party_bull.json",
        "https://ipfs.io/ipfs/QmdcURmN1kEEtKgnbkVJJ8hrmsSWHpZvLkRgsKKoiWvW9g?filename=simple_bull.json"
    ];
    string[] bearUrisIpfs = [
        "https://ipfs.io/ipfs/Qmdx9Hx7FCDZGExyjLR6vYcnutUR8KhBZBnZfAPHiUommN?filename=beanie_bear.json",
        "https://ipfs.io/ipfs/QmTVLyTSuiKGUEmb88BgXG3qNC8YgpHZiFbjHrXKH3QHEu?filename=coolio_bear.json",
        "https://ipfs.io/ipfs/QmbKhBXVWmwrYsTPFYfroR2N7NAekAMxHUVg2CWks7i9qj?filename=simple_bear.json"
    ];

    constructor(uint256 interval, address priceFeedAddress) ERC721("Bull&Bear", "BBTK") {
        i_interval = interval;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        s_lastTimestamp = block.timestamp;
        s_lastPrice = getCurrentPrice();
    }

    function safeMint(address to) public {
        // Current counter value will be the minted token's token ID.
        uint256 tokenId = _tokenIdCounter.current();

        // Increment it so next time it's correct when we call .current()
        _tokenIdCounter.increment();

        // Mint the token
        _safeMint(to, tokenId);

        // Default to a bull NFT
        string memory defaultUri = bullUrisIpfs[0];
        _setTokenURI(tokenId, defaultUri);

        // console.log("DONE!!! minted token ", tokenId, " and assigned token url: ", defaultUri);
    }

    function getCurrentPrice() private view returns (int256) {
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        return price;
    }

    // Chainlink keeper functions
    function checkUpkeep(
        bytes memory /*checkData*/
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /*performData*/
        )
    {
        upkeepNeeded = (block.timestamp - s_lastTimestamp) > i_interval;
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(
        bytes calldata /*performData*/
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert BullBear__UpkeepNotNeeded();
        }
        s_lastTimestamp = block.timestamp;

        int256 currentPrice = getCurrentPrice();

        if (currentPrice > s_lastPrice) {
            updateAllTokenUris("bull");
        }

        if (currentPrice < s_lastPrice) {
            updateAllTokenUris("bear");
        }
    }

    function updateAllTokenUris(string memory trend) internal {
        if (compareStrings("bear", trend)) {
            for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
                _setTokenURI(i, bearUrisIpfs[0]);
            }
        } else {
            for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
                _setTokenURI(i, bullUrisIpfs[0]);
            }
        }
        emit TokensUpdated(trend);
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getLastPrice() public view returns (int256) {
        return s_lastPrice;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}
