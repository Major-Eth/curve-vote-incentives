import React, {useState, useContext, createContext} from 'react';
import {Contract} from 'ethcall';
import {ethers} from 'ethers';
import useClientEffect from 'hooks/useClientEffect';
import useWeb3 from 'contexts/useWeb3';
import {newEthCallProvider, isAddress} from 'utils';
import GAUGES_INFO from 'utils/gaugesInfo';
import * as CONST from 'utils/constants';
import * as ABI from 'utils/abis';

const DEFAULT_TOKENS = [
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
		decimals: 18
	}
];

function _mapGaugeTypeToName(gaugeType) {
	switch (gaugeType) {
	case 0:
	case 3:
	case 5:
	case 6:
		return 'Ethereum';
	case 1:
		return 'Fantom';
	case 2:
		return 'Polygon';
	case 4:
		return 'Gnosis Chain (xDai)';
	default:
		return 'Unknown';
	}
}

const GaugesContext = createContext();
export const GaugesContextApp = ({children}) => {
	const {provider, address, active} = useWeb3();
	const [gauges, set_gauges] = useState(null);
	const [votes, set_votes] = useState(null);
	const [rewards, set_rewards] = useState([]);
	const [voteRewards, set_voteRewards] = useState([]);

	/**************************************************************************
	 **	This part is focused on retrieving all the gauges. This is not related
	 **	to a specific wallet but this is only possible with a mainnet provider
	 **************************************************************************/
	async function _getGauges(_provider) {
		try {
			const gaugeController = new Contract(
				CONST.GAUGE_CONTROLLER_ADDRESS,
				ABI.GAUGE_CONTROLLER_ABI
			);
			const ethcallProvider = await newEthCallProvider(_provider);
			const [nGauges] = await ethcallProvider.tryAll([
				gaugeController.n_gauges()
			]);
			const numberOfGauges = nGauges.toNumber();

			let calls = [];
			for (let index = 0; index < numberOfGauges; index++) {
				calls.push(gaugeController.gauges(index));
			}
			const gaugesAddressesCallResult = await ethcallProvider.tryAll(
				calls
			);

			calls = [];
			for (let index = 0; index < numberOfGauges; index++) {
				calls.push(
					gaugeController.gauge_types(
						gaugesAddressesCallResult[index]
					)
				);
				calls.push(
					gaugeController.gauge_relative_weight(
						gaugesAddressesCallResult[index]
					)
				);
			}
			const gaugesInfoCallResult = await ethcallProvider.tryAll(calls);

			const result = [];
			let rIndex = 0;
			for (let index = 0; index < numberOfGauges; index++) {
				const gaugeType = gaugesInfoCallResult[rIndex++];
				const gaugeWeight = gaugesInfoCallResult[rIndex++];
				const gaugeAddress = gaugesAddressesCallResult[index];

				let name = 'Unknown';
				let lpTokenAddress = '';
				if (GAUGES_INFO[gaugeAddress]) {
					name = GAUGES_INFO[gaugeAddress].name;
					lpTokenAddress = GAUGES_INFO[gaugeAddress].lpTokenAddress;
				} else if ([0, 5, 6].includes(gaugeType.toNumber())) {
					try {
						const gauge = new ethers.Contract(
							gaugeAddress,
							['function lp_token() view returns (address)'],
							_provider
						);
						lpTokenAddress = await gauge.lp_token();
						const lpToken = new ethers.Contract(
							lpTokenAddress,
							['function name() view returns (string)'],
							_provider
						);
						name = await lpToken.name();
					} catch (e) {
						/**/
					}
				}

				const gaugeInfo = {
					gaugeAddress: gaugeAddress,
					lpTokenAddress: lpTokenAddress,
					name: name,
					gaugeWeight: gaugeWeight,
					gaugeType: gaugeType.toNumber(),
					gaugeTypeName: _mapGaugeTypeToName(gaugeType.toNumber()),
					logo: '/unknown-logo.png'
				};
				result.push(gaugeInfo);
			}
			set_gauges(result.filter((g) => g !== null));
		} catch (ex) {
			console.log('------------------------------------');
			console.log('exception thrown in _getGauges()');
			console.log(ex);
			console.log('------------------------------------');
		}
	}
	React.useEffect(() => {
		if (provider) _getGauges(provider);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider]);

	/**************************************************************************
	 **	This part is used to retrieve the current votes for Curve. This is
	 **	only possible with a mainnet provider
	 **************************************************************************/
	async function _getVotes(_provider) {
		const votesSourceContract = new Contract(
			CONST.VOTE_SOURCE_ADDRESS,
			ABI.VOTE_SOURCE_ABI
		);
		const votesBriberyContract = new Contract(
			CONST.VOTE_BRIBERY_ADDRESS,
			ABI.VOTE_BRIBERY_ABI
		);
		const ethcallProvider = await newEthCallProvider(_provider);
		const [nVotes] = await ethcallProvider.tryAll([
			votesSourceContract.votesLength()
		]);
		const numberOfVotes = nVotes.toNumber();

		const calls = [];
		for (
			let index = process.env.INITIAL_VOTE_INDEX;
			index < numberOfVotes;
			index++
		) {
			calls.push(votesSourceContract.getVote(index));
			calls.push(votesBriberyContract.rewards_per_vote(index));
		}
		const callResult = await ethcallProvider.tryAll(calls);
		const result = [];
		let rIndex = 0;
		for (
			let index = process.env.INITIAL_VOTE_INDEX;
			index < numberOfVotes;
			index++
		) {
			const voteInfo = {
				index,
				vote: callResult[rIndex++],
				rewardsPerVote: callResult[rIndex++]
			};
			result.push(voteInfo);
		}
		set_votes(result);
	}
	React.useEffect(() => {
		if (provider) _getVotes(provider);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider]);

	/**************************************************************************
	 **	This part is focused on retrieving the rewards informations for the
	 **	above gauges for a specific account, aka the connected one.
	 **************************************************************************/
	async function _getCurrentGaugeVotes(_provider, _address, _gauges) {
		const gaugeController = new ethers.Contract(
			CONST.GAUGE_CONTROLLER_ADDRESS,
			[
				'function vote_user_slopes(address, address) public view returns (uint256 slope, uint256 power, uint256 end)'
			],
			_provider
		);
		const userVoteSlopes = await Promise.all(
			_gauges.map((gauge) =>
				gaugeController.vote_user_slopes(_address, gauge.gaugeAddress)
			)
		);

		for (let i = 0; i < _gauges.length; i++) {
			_gauges[i].votes = {
				end: userVoteSlopes[i].end,
				power: userVoteSlopes[i].power,
				slope: userVoteSlopes[i].slope,
				userVoteSlopeAmount: ethers.BigNumber.from(
					userVoteSlopes[i].slope
				)
					.div(10 ** 10)
					.toNumber()
					.toFixed(10),
				userVoteSlopePercent: ethers.BigNumber.from(
					userVoteSlopes[i].power
				)
					.div(100)
					.toNumber()
					.toFixed(2)
			};
		}

		return _gauges;
	}

	async function _getTokenInfo(_provider, _tokenAddress) {
		try {
			const token = new ethers.Contract(
				_tokenAddress,
				ABI.ERC20_ABI,
				_provider
			);
			const [symbol, decimals, balance] = await Promise.all([
				token.symbol(),
				token.decimals(),
				token.balanceOf(address)
			]);

			return {
				address: _tokenAddress,
				symbol,
				decimals: parseInt(decimals),
				balance
			};
		} catch (ex) {
			console.log('------------------------------------');
			console.log('exception thrown in _getTokenInfo()');
			console.log(ex);
			console.log('------------------------------------');
			return ex;
		}
	}

	async function _getBribery(
		_provider,
		_address,
		_gauges,
		_rewardTokens,
		_rewardTokenAddress
	) {
		const block = (await _provider.getBlock('latest')).number;
		const briberyV2 = new ethers.Contract(
			CONST.BRIBERY_ADDRESS_V2,
			ABI.BRIBERY_ABI,
			_provider
		);
		const briberyTokensContract = new ethers.Contract(
			CONST.BRIBERY_TOKENS_ADDRESS_V2,
			ABI.BRIBERY_ABI,
			_provider
		);

		// For V2 call gauges_per_reward.
		// foreach of those, we get the user's reward only. no looping through dead gauges anymore.
		const [gaugesPerRewardV2] = await Promise.all([
			briberyV2.gauges_per_reward(_rewardTokenAddress)
		]);

		let briberyResultsPromisesV2 = [];
		if (gaugesPerRewardV2.length > 0) {
			briberyResultsPromisesV2 = gaugesPerRewardV2.map(async (gauge) => {
				const [
					activePeriod,
					claimable,
					lastUserClaim,
					tokensForBribe,
					rewardPerToken
				] = await Promise.all([
					briberyV2.active_period(gauge, _rewardTokenAddress),
					briberyV2.claimable(_address, gauge, _rewardTokenAddress),
					briberyV2.last_user_claim(
						_address,
						gauge,
						_rewardTokenAddress
					),
					briberyTokensContract.tokens_for_bribe(
						_address,
						gauge,
						_rewardTokenAddress
					),
					briberyV2.reward_per_token(gauge, _rewardTokenAddress)
				]);

				return {
					version: 2,
					claimable,
					lastUserClaim,
					activePeriod,
					tokensForBribe,
					rewardPerToken,
					canClaim: ethers.BigNumber.from(block).lt(
						ethers.BigNumber.from(activePeriod).add(CONST.WEEK)
					),
					hasClaimed:
						ethers.BigNumber.from(lastUserClaim).eq(activePeriod),
					gauge: _gauges.filter((g) => {
						return (
							g.gaugeAddress.toLowerCase() === gauge.toLowerCase()
						);
					})[0],
					rewardToken: _rewardTokens.filter((r) => {
						return (
							r.address.toLowerCase() ===
							_rewardTokenAddress.toLowerCase()
						);
					})[0]
				};
			});
		}

		const briberyResultsV2 = await Promise.all(briberyResultsPromisesV2);
		return [briberyResultsV2];
	}

	async function getRewards(payload) {
		if (!gauges || gauges.length === 0) {
			return null;
		}
		const _gauges = await _getCurrentGaugeVotes(provider, address, gauges);

		let myParam = null;
		if (payload?.content && payload.content.address) {
			myParam = payload.content.address;
		} else {
			const urlParams = new URLSearchParams(window.location.search);
			myParam = urlParams.get('reward');
		}
		const rewardTokenAddress = myParam;

		//If it is a valid token, we add it to the search list
		if (isAddress(rewardTokenAddress)) {
			let includesToken = false;
			for (let i = 0; i < DEFAULT_TOKENS.length; i++) {
				if (
					DEFAULT_TOKENS[i].address.toLowerCase() ===
					rewardTokenAddress.toLowerCase()
				) {
					includesToken = true;
					break;
				}
			}

			if (!includesToken) {
				const rewardToken = await _getTokenInfo(
					provider,
					rewardTokenAddress
				);
				DEFAULT_TOKENS.push(rewardToken);
			}
		}

		const briberies = [];
		for (let index = 0; index < DEFAULT_TOKENS.length; index++) {
			const token = DEFAULT_TOKENS[index];
			const bribery = await _getBribery(
				provider,
				address,
				_gauges,
				DEFAULT_TOKENS,
				token.address
			);
			briberies.push(bribery);
		}

		const flatBriberies = briberies.flat();
		const rewards = [];
		for (let j = 0; j < flatBriberies.length; j++) {
			let bribery = flatBriberies[j];
			for (let i = 0; i < bribery.length; i++) {
				const bribe = bribery[i];
				rewards.push({
					activePeriod: bribe.activePeriod,
					rewardsUnlock: ethers.BigNumber.from(bribe.activePeriod)
						.add(CONST.WEEK)
						.toNumber()
						.toFixed(0),
					claimable: ethers.utils.formatUnits(
						bribe.claimable,
						bribe.rewardToken.decimals
					),
					canClaim: bribe.canClaim,
					hasClaimed: bribe.hasClaimed,
					gauge: bribe.gauge,
					tokensForBribe: ethers.utils.formatUnits(
						bribe.tokensForBribe,
						bribe.rewardToken.decimals
					),
					rewardPerToken: bribe.rewardPerToken,
					rewardToken: bribe.rewardToken
				});
			}
		}
		set_rewards(rewards);
	}

	async function getVoteRewards() {
		if (!votes || votes.length === 0) {
			return null;
		}

		const voteBriberyContract = new ethers.Contract(
			CONST.VOTE_BRIBERY_ADDRESS,
			ABI.VOTE_BRIBERY_ABI
		);
		const votesSourceContract = new ethers.Contract(
			CONST.VOTE_SOURCE_ADDRESS,
			ABI.VOTE_SOURCE_ABI
		);

		const res = [];
		for (let index = 0; index < votes.length; index++) {
			const vote = votes[index];

			if (!vote.rewardsPerVote || vote.rewardsPerVote.length === 0) {
				continue;
			}

			const _rewards = await Promise.all(
				vote.rewardsPerVote.map(async (rewardTokenAddress) => {
					const [
						estimateBribe,
						rewardAmount,
						voterState,
						hsaClaimed
					] = await Promise.all([
						voteBriberyContract.estimate_bribe(
							vote.index,
							rewardTokenAddress,
							address
						),
						voteBriberyContract.reward_amount(
							vote.index,
							rewardTokenAddress
						),
						votesSourceContract.getVoterState(vote.index, address),
						voteBriberyContract.has_claimed(
							vote.index,
							rewardTokenAddress,
							address
						)
					]);
					const rewardToken = await _getTokenInfo(
						provider,
						rewardTokenAddress
					);
					console.log({
						estimateBribe,
						rewardAmount,
						voterState,
						hsaClaimed
					});
					return {
						estimateBribe: ethers.utils.formatUnits(
							estimateBribe,
							rewardToken.decimals
						),
						rewardAmount: ethers.utils.formatUnits(
							rewardAmount,
							rewardToken.decimals
						),
						voterState,
						hsaClaimed,
						vote,
						rewardToken
					};
				})
			);
			res.push(_rewards);
		}
		set_voteRewards(res.filter((r) => r != null).flat());
	}

	useClientEffect(() => {
		if (!active) return;
		getRewards();
		getVoteRewards();
	}, [active, gauges]);

	return (
		<GaugesContext.Provider value={{rewards, voteRewards, gauges, votes}}>
			{children}
		</GaugesContext.Provider>
	);
};

export const useGauges = () => useContext(GaugesContext);
export default useGauges;
