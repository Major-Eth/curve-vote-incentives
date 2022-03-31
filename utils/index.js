import {ethers} from 'ethers';
import {Provider} from 'ethcall';

export function formatCurrency(amount, decimals = 2) {
	if (!isNaN(amount)) {
		if (ethers.BigNumber.from(amount).gt(0) && ethers.BigNumber.from(amount).lt(1))
			return '< 1';

		const formatter = new Intl.NumberFormat(undefined, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		});

		return formatter.format(amount);
	}
	return 0;
}

export function truncateAddress(address) {
	if (address !== undefined) {
		return `${address.slice(0, 4)}...${address.slice(-4)}`;
	}
	return '0x000...0000';
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
			console.warn('Could not connect to test provider, using mainnet provider');
			await ethcallProvider.init(provider);
			return ethcallProvider;
		}
	}
	await ethcallProvider.init(provider);
	return ethcallProvider;
}

export function units(value, unitName) {
	return (ethers.utils.formatUnits(value, unitName));
}
export function	bigNumberAsAmount(bnAmount = ethers.BigNumber.from(0), decimals = 18, decimalsToDisplay = 2, symbol = ''){
	let		locale = 'fr-FR';
	if (typeof(navigator) !== 'undefined')
		locale = navigator.language || 'fr-FR';
	
	let	symbolWithPrefix = symbol;
	if (symbol.length > 0 && symbol !== '%') {
		symbolWithPrefix = ` ${symbol}`;
	}

	if (bnAmount.isZero()) {
		return (`0${symbolWithPrefix}`);
	} else if (bnAmount.eq(ethers.constants.MaxUint256)) {
		return (`∞${symbolWithPrefix}`);
	}

	const	formatedAmount = units(bnAmount, decimals);
	return (`${
		new Intl.NumberFormat([locale, 'en-US'], {
			minimumFractionDigits: 0,
			maximumFractionDigits: decimalsToDisplay
		}).format(Number(formatedAmount))
	}${symbolWithPrefix}`);
}
