import {ethers} from 'ethers';
import {Provider} from 'ethcall';

export function formatCurrency(amount, decimals = 2) {
	if (!isNaN(amount)) {
		if (
			ethers.BigNumber.from(amount).gt(0) &&
			ethers.BigNumber.from(amount).lt(1)
		) {
			return '< 1';
		}

		const formatter = new Intl.NumberFormat(undefined, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		});

		return formatter.format(amount);
	} else {
		return 0;
	}
}

export function truncateAddress(address) {
	if (address !== undefined) {
		return `${address.slice(0, 4)}...${address.slice(-4)}`;
	}
	return '0x000...0000';
}

export function formatAddress(address, length = 'short') {
	if (address && length === 'short') {
		address =
			address.substring(0, 6) +
			'...' +
			address.substring(address.length - 4, address.length);
		return address;
	} else if (address && length === 'long') {
		address =
			address.substring(0, 12) +
			'...' +
			address.substring(address.length - 8, address.length);
		return address;
	} else {
		return null;
	}
}

export function sqrt(value) {
	if (value < 0n) {
		throw new Error('square root of negative numbers is not supported');
	}

	if (value < 2n) {
		return value;
	}

	function newtonIteration(n, x0) {
		// eslint-disable-next-line no-bitwise
		const x1 = (n / x0 + x0) >> 1n;
		if (x0 === x1 || x0 === x1 - 1n) {
			return x0;
		}
		return newtonIteration(n, x1);
	}

	return newtonIteration(value, 1n);
}

export const toAddress = (address) => {
	if (!address) {
		return ethers.constants.AddressZero;
	}
	if (address === 'GENESIS') {
		return ethers.constants.AddressZero;
	}
	try {
		return ethers.utils.getAddress(address);
	} catch (error) {
		return ethers.constants.AddressZero;
	}
};

export const isAddress = (address) => {
	return toAddress(address) !== ethers.constants.AddressZero;
};

export async function newEthCallProvider(provider) {
	const ethcallProvider = new Provider();
	if (process.env.IS_TEST) {
		try {
			await ethcallProvider.init(
				new ethers.providers.JsonRpcProvider('http://localhost:8545')
			);
			ethcallProvider.multicall = {
				address: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441'
			};
			ethcallProvider.multicall2 = {
				address: '0x5ba1e12693dc8f9c48aad8770482f4739beed696'
			};
			return ethcallProvider;
		} catch (error) {
			console.warn(
				'Could not connect to test provider, using mainnet provider'
			);
			await ethcallProvider.init(provider);
			return ethcallProvider;
		}
	}
	await ethcallProvider.init(provider);
	return ethcallProvider;
}
