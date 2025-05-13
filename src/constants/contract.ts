export const CONTRACT_ADDRESS = "0xc07102dcb2b70a2c444cf267864ee258e42e6b67";
export const NFT_CONTRACT_ADDRESS = "0xCA769BC59C5DCc18DD4DA631292c4b208aE2DBC9";

export const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_contract",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_wallet",
				"type": "address"
			}
		],
		"name": "getERC721Balance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]