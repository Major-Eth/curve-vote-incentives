import	React, {useState, useContext, createContext}	from	'react';
import	{ethers}							from	'ethers';
import	useClientEffect						from	'hooks/useClientEffect';
import	useWeb3								from	'contexts/useWeb3';
import	{isAddress}							from	'utils';

import {WEEK, GAUGE_CONTROLLER_ADDRESS, BRIBERY_ADDRESS_V2, BRIBERY_TOKENS_ADDRESS_V2} from 'stores/constants';
import {BRIBERY_ABI, GAUGE_CONTRACT_ABI, ERC20_ABI} from 'stores/abis';


const	DEFAULT_TOKENS = [
	{
		address: '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
		symbol: 'FTM',
		decimals: 18
	},
	{
		address: '0x2ba592f78db6436527729929aaf6c908497cb200',
		symbol: 'CREAM',
		decimals: 18
	},
	{
		address: '0x090185f2135308bad17527004364ebcc2d37e5f6',
		symbol: 'SPELL',
		decimals: 18
	},
	{
		address: '0x6b175474e89094c44da98b954eedeac495271d0f',
		symbol: 'DAI',
		decimals: 18
	},
	{
		address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
		symbol: 'USDC',
		decimals: 6
	},
	{
		address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
		symbol: 'LDO',
		decimals: 18
	},
	{
		address: '0xdbdb4d16eda451d0503b854cf79d55697f90c8df',
		symbol: 'ALCX',
		decimals: 18
	},
	{
		address: '0x9D79d5B61De59D882ce90125b18F74af650acB93',
		symbol: 'NSBT',
		decimals: 6
	},
	{
		address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
		symbol: 'MATIC',
		decimals: 18
	},
	{
		address: '0x92e187a03b6cd19cb6af293ba17f2745fd2357d5',
		symbol: 'DUCK',
		decimals: 18
	},
	{
		address: '0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26',
		symbol: 'OGN',
		decimals: 18
	},
	{
		address: '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2',
		symbol: 'MTA',
		decimals: 18
	},
	{
		address: '0xd533a949740bb3306d119cc777fa900ba034cd52',
		symbol: 'CRV',
		decimals: 18
	},
	{
		address: '0xcdf7028ceab81fa0c6971208e83fa7872994bee5',
		symbol: 'T',
		decimals: 18
	},
	{
		address: '0xdb25f211ab05b1c97d595516f45794528a807ad8',
		symbol: 'EURS',
		decimals: 2
	},
	{
		address: '0x31429d1856aD1377A8A0079410B297e1a9e214c2',
		symbol: 'ANGLE',
		decimals: 18,
	},
];

function	_mapGaugeTypeToName(gaugeType) {
	switch (gaugeType) {
	case '0':
	case '3':
	case '5':
	case '6':
		return 'Ethereum';
	case '1':
		return 'Fantom';
	case '2':
		return 'Polygon';
	case '4':
		return 'xDAI';
	default:
		return 'Unknown';
	}
}

const RewardsContext = createContext();
export const RewardsContextApp = ({children}) => {
	const	{provider, address, active} = useWeb3();
	const	[gauges, set_gauges] = useState(null);
	const	[rewards, set_rewards] = useState([]);

	async function _getGaugeInfo(_provider, _gaugeController, _index) {
		try {
			const gaugeAddress = await _gaugeController.gauges(_index);
			const [gaugeType, gaugeWeight] = await Promise.all([
				_gaugeController.gauge_types(gaugeAddress),
				_gaugeController.gauge_relative_weight(gaugeAddress)
			]);
					
			let name = 'Unknown';
			let lpTokenAddress = '';
					
			if(['0', '5', '6'].includes(gaugeType)) {
				const gauge = new ethers.Contract(gaugeAddress, GAUGE_CONTRACT_ABI, _provider);
				lpTokenAddress = await gauge.methods.lp_token();
				// if not 0, we cant get LP token info cause it is on a different chain
				const lpToken = new ethers.Contract(lpTokenAddress, ERC20_ABI, _provider);
				name = await lpToken.methods.name();
			} else {
				//manually map gauge names
				switch (gaugeAddress) {
				case '0xb9C05B8EE41FDCbd9956114B3aF15834FDEDCb54':
					name = 'Curve.fi DAI/USDC (DAI+USDC)';
					break;
				case '0xfE1A3dD8b169fB5BF0D5dbFe813d956F39fF6310':
					name = 'Curve.fi fUSDT/DAI/USDC';
					break;
				case '0xC48f4653dd6a9509De44c92beb0604BEA3AEe714':
					name = 'Curve.fi amDAI/amUSDC/amUSDT';
					break;
				case '0x6955a55416a06839309018A8B0cB72c4DDC11f15':
					name = 'Curve.fi USD-BTC-ETH';
					break;
				case '0x488E6ef919C2bB9de535C634a80afb0114DA8F62':
					name = 'Curve.fi amWBTC/renBTC';
					break;
				case '0xfDb129ea4b6f557b07BcDCedE54F665b7b6Bc281':
					name = 'Curve.fi WBTC/renBTC';
					break;
				case '0x060e386eCfBacf42Aa72171Af9EFe17b3993fC4F':
					name = 'Curve USD-BTC-ETH';
					break;
				case '0x6C09F6727113543Fd061a721da512B7eFCDD0267':
					name = 'Curve.fi wxDAI/USDC/USDT';
					break;
				case '0xDeFd8FdD20e0f34115C7018CCfb655796F6B2168':
					name = 'Curve.fi USD-BTC-ETH';
					break;
				case '0xd8b712d29381748dB89c36BCa0138d7c75866ddF':
					name = 'Curve.fi Factory USD Metapool: Magic Internet Money 3Pool';
					break;
				default:
				}
			}
					
			return {
				gaugeAddress: gaugeAddress,
				lpTokenAddress: lpTokenAddress,
				name: name,
				gaugeWeight: gaugeWeight,
				gaugeType: gaugeType,
				gaugeTypeName: _mapGaugeTypeToName(gaugeType),
				logo: '/unknown-logo.png'
			};
		} catch(ex) {
			console.log('------------------------------------');
			console.log('exception thrown in _getGaugeInfo()');
			console.log(ex);
			console.log('------------------------------------');
			return null;
		}
	}

	async function _getGauges(_provider) {
		try {
			const gaugeController = new ethers.Contract(GAUGE_CONTROLLER_ADDRESS, [
				'function n_gauges() public view returns (int128)',
				'function gauges(uint256) public view returns (address)',
				'function gauge_types(address) public view returns (int128)',
				'function gauge_relative_weight(address) public view returns (uint256)',
			], _provider);
			const nGauges = await gaugeController.n_gauges();
			const arr = [...Array(parseInt(nGauges)).keys()];
			const promises = arr.map(index => {
				return new Promise((resolve) => {
					const gaugeInfo = _getGaugeInfo(_provider, gaugeController, index);
					resolve(gaugeInfo);
				});
			});
					
			const result = await Promise.all(promises);
			const res = result.filter((g) => g !== null);
			return res;
		} catch(ex) {
			console.log('------------------------------------');
			console.log('exception thrown in _getGauges()');
			console.log(ex);
			console.log('------------------------------------');
		}
	}

	React.useEffect(() => {
		if (provider)
			_getGauges(provider).then(_gauges => set_gauges(_gauges));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider]);

	console.log(gauges);

	async function _getCurrentGaugeVotes(_provider, _address, _gauges) {
		const gaugeController = new ethers.Contract(GAUGE_CONTROLLER_ADDRESS, [
			'function vote_user_slopes(address, address) public view returns (uint256 slope, uint256 power, uint256 end)',
		], _provider);
		const userVoteSlopes = await Promise.all(_gauges.map((gauge) => gaugeController.vote_user_slopes(_address, gauge.gaugeAddress)));
						
		for(let i = 0; i < _gauges.length; i++) {
			_gauges[i].votes = {
				end: userVoteSlopes[i].end,
				power: userVoteSlopes[i].power,
				slope: userVoteSlopes[i].slope,
				userVoteSlopeAmount: (ethers.BigNumber.from(userVoteSlopes[i].slope).div(10**10)).toNumber().toFixed(10),
				userVoteSlopePercent: (ethers.BigNumber.from(userVoteSlopes[i].power).div(100)).toNumber().toFixed(2)
			};
		}
						
		return _gauges;
	}

	async function _getTokenInfo(_provider, _tokenAddress) {
		try {
			const token = new ethers.Contract(_tokenAddress, ERC20_ABI, _provider);
			const [symbol, decimals, balance] = await Promise.all([token.symbol(), token.decimals(), token.balanceOf(address)]);

			return {
				address: _tokenAddress,
				symbol,
				decimals: parseInt(decimals),
				balance
			};
			
		} catch(ex) {
			console.log('------------------------------------');
			console.log('exception thrown in _getTokenInfo()');
			console.log(ex);
			console.log('------------------------------------');
			return ex;
		}
	}

	async function _getBribery(_provider, _address, _gauges, _rewardTokens, _rewardTokenAddress) {
		const block = (await _provider.getBlock('latest')).number;
		const briberyV2 = new ethers.Contract(BRIBERY_ADDRESS_V2, BRIBERY_ABI, _provider);
		const briberyTokensContract = new ethers.Contract(BRIBERY_TOKENS_ADDRESS_V2, BRIBERY_ABI, _provider);
		
		// For V2 call gauges_per_reward.
		// foreach of those, we get the user's reward only. no looping through dead gauges anymore.
		const [gaugesPerRewardV2] = await Promise.all([briberyV2.gauges_per_reward(_rewardTokenAddress)]);
		
		let briberyResultsPromisesV2 = [];
		if(gaugesPerRewardV2.length > 0) {
			briberyResultsPromisesV2 = gaugesPerRewardV2.map(async (gauge) => {
				const [activePeriod, claimable, lastUserClaim, tokensForBribe, rewardPerToken] = await Promise.all([
					briberyV2.active_period(gauge, _rewardTokenAddress),
					briberyV2.claimable(_address, gauge, _rewardTokenAddress),
					briberyV2.last_user_claim(_address, gauge, _rewardTokenAddress),
					briberyTokensContract.tokens_for_bribe(_address, gauge, _rewardTokenAddress),
					briberyV2.reward_per_token(gauge, _rewardTokenAddress),
				]);
		
				return {
					version: 2,
					claimable,
					lastUserClaim,
					activePeriod,
					tokensForBribe,
					rewardPerToken,
					canClaim: ethers.BigNumber.from(block).lt(ethers.BigNumber.from(activePeriod).add(WEEK)),
					hasClaimed: ethers.BigNumber.from(lastUserClaim).eq(activePeriod),
					gauge: _gauges.filter((g) => { return g.gaugeAddress.toLowerCase() === gauge.toLowerCase(); })[0],
					rewardToken: _rewardTokens.filter((r) => { return r.address.toLowerCase() === _rewardTokenAddress.toLowerCase(); })[0]
				};
			});
		}
		
		const briberyResultsV2 = await Promise.all(briberyResultsPromisesV2);
		return [briberyResultsV2];
	}

	async function getBalances(payload) {
		if (!gauges || gauges.length === 0) {
			return null;
		}
		const	_gauges = await _getCurrentGaugeVotes(provider, address, gauges);
							
		let myParam = null;
		if(payload?.content && payload.content.address) {
			myParam = payload.content.address;
		} else {
			const urlParams = new URLSearchParams(window.location.search);
			myParam = urlParams.get('reward');
		}
		const rewardTokenAddress = myParam;
							
		//If it is a valid token, we add it to the search list
		if(isAddress(rewardTokenAddress)) {
			let includesToken = false;
			for(let i = 0; i < DEFAULT_TOKENS.length; i++) {
				if(DEFAULT_TOKENS[i].address.toLowerCase() === rewardTokenAddress.toLowerCase()) {
					includesToken = true;
					break;
				}
			}
							
			if(!includesToken) {
				const rewardToken = await _getTokenInfo(provider, rewardTokenAddress);
				DEFAULT_TOKENS.push(rewardToken);
			}
		}
			
		const briberies = [];
		for (let index = 0; index < DEFAULT_TOKENS.length; index++) {
			const token = DEFAULT_TOKENS[index];
			const bribery = await _getBribery(provider, address, _gauges, DEFAULT_TOKENS, token.address);
			briberies.push(bribery);
		}

		const	flatBriberies = briberies.flat();
		const	rewards = [];
		for(let j = 0; j < flatBriberies.length; j++) {
			let bribery = flatBriberies[j];
			for(let i = 0; i < bribery.length; i++) {
				const bribe = bribery[i];
				rewards.push({
					activePeriod: bribe.activePeriod,
					rewardsUnlock: (ethers.BigNumber.from(bribe.activePeriod).add(WEEK)).toNumber().toFixed(0),
					claimable: ethers.utils.formatUnits(bribe.claimable, bribe.rewardToken.decimals),
					canClaim: bribe.canClaim,
					hasClaimed: bribe.hasClaimed,
					gauge: bribe.gauge,
					tokensForBribe: ethers.utils.formatUnits(bribe.tokensForBribe, bribe.rewardToken.decimals),
					rewardPerToken: bribe.rewardPerToken,
					rewardToken: bribe.rewardToken
				});
			}
		}
		set_rewards(rewards);
	}

	useClientEffect(() => {
		if (!active)
			return;
		getBalances();
	}, [active, gauges]);

	return (
		<RewardsContext.Provider
			value={{
				rewards
			}}>
			{children}
		</RewardsContext.Provider>
	);
};

export const useRewards = () => useContext(RewardsContext);
export default useRewards;
