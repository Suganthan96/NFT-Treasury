export const CONTRACT_ADDRESS = "0xc07102dcb2b70a2c444cf267864ee258e42e6b67";
export const NFT_CONTRACT_ADDRESS = "0xd92c6FFB0f70B85AeD6eAA72DBaf149263ebD40f";

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