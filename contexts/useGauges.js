import React, {useState, useContext, createContext} from 'react';
import {Contract} from 'ethcall';
import {ethers} from 'ethers';
import useClientEffect from 'hooks/useClientEffect';
import useWeb3 from 'contexts/useWeb3';
import {newEthCallProvider} from 'utils';
import GAUGES_INFO from 'utils/gaugesInfo';
import DEFAULT_TOKENS from 'utils/defaultsTokens';
import * as CONST from 'utils/constants';
import * as ABI from 'utils/abis';

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
	const {provider, getProvider, address, active} = useWeb3();
	const [gauges, set_gauges] = useState(null);
	const [votes, set_votes] = useState(null);
	const [rewards, set_rewards] = useState([]);
	const [voteRewards, set_voteRewards] = useState([]);

	/**************************************************************************
	 **	This part is focused on retrieving all the gauges. This is not related
	 **	to a specific wallet but this is only possible with a mainnet provider
	 **************************************************************************/
	async function _getGauges(_provider) {
		// console.group('Get Gauges');
		const gaugeController = new Contract(CONST.GAUGE_CONTROLLER_ADDRESS, ABI.GAUGE_CONTROLLER_ABI);
		const ethcallProvider = await newEthCallProvider(_provider);
		const [nGauges] = await ethcallProvider.tryAll([gaugeController.n_gauges()]);
		const numberOfGauges = nGauges.toNumber();
		// console.log(`numberOfGauges: ${numberOfGauges}. Fetching gauges addresses ...`);

		let calls = [];
		for (let index = 0; index < numberOfGauges; index++) {
			calls.push(gaugeController.gauges(index));
		}
		const gaugesAddressesCallResult = await ethcallProvider.tryAll(calls);

		// console.log('Gauges addresses Fetched! Fetching gauges type and weight ...');
		calls = [];
		for (let index = 0; index < numberOfGauges; index++) {
			calls.push(gaugeController.gauge_types(gaugesAddressesCallResult[index]));
			calls.push(gaugeController.gauge_relative_weight(gaugesAddressesCallResult[index]));
		}
		const gaugesInfoCallResult = await ethcallProvider.tryAll(calls);
		// console.log('Gauges type and weight fetched! Preparing structure ...');

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
					const gauge = new ethers.Contract(gaugeAddress, ['function lp_token() view returns (address)'], _provider);
					lpTokenAddress = await gauge.lp_token();
					const lpToken = new ethers.Contract(lpTokenAddress, ['function name() view returns (string)'], _provider);
					name = await lpToken.name();
					console.warn(`Missing data for gauge [${gaugeAddress}] in local registry: [${name}] -> [${lpTokenAddress}]`);
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
		// console.log('Gauges are initialized!');
		// console.groupEnd('Get Gauges');
		set_gauges(result.filter((g) => g !== null));
	}
	React.useEffect(() => {
		_getGauges(getProvider());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**************************************************************************
	 **	This part is used to retrieve the current votes for Curve. This is
	 **	only possible with a mainnet provider
	 **************************************************************************/
	async function _getVotes(_provider) {
		// console.group('Get Votes');
		const votesSourceContract = new Contract(CONST.VOTE_SOURCE_ADDRESS, ABI.VOTE_SOURCE_ABI);
		const votesBriberyContract = new Contract(CONST.VOTE_BRIBERY_ADDRESS, ABI.VOTE_BRIBERY_ABI);
		const ethcallProvider = await newEthCallProvider(_provider);
		const [nVotes] = await ethcallProvider.tryAll([votesSourceContract.votesLength()]);
		const numberOfVotes = nVotes.toNumber();
		// console.log(`numberOfVotes: ${numberOfVotes}. Fetching votes info...`);


		const calls = [];
		for (let index = process.env.INITIAL_VOTE_INDEX; index < numberOfVotes; index++) {
			calls.push(votesSourceContract.getVote(index));
			calls.push(votesBriberyContract.rewards_per_vote(index));
		}
		const callResult = await ethcallProvider.tryAll(calls);
		// console.log('Votes info fetched! Preparing structure ...');

		const result = [];
		let rIndex = 0;
		for (let index = process.env.INITIAL_VOTE_INDEX; index < numberOfVotes; index++) {
			const voteInfo = {
				index,
				vote: callResult[rIndex++],
				rewardsPerVote: callResult[rIndex++]
			};
			result.push(voteInfo);
		}
		set_votes(result);
		// console.log('Votes are initialized!');
		// console.groupEnd('Get Votes');
	}
	React.useEffect(() => {
		_getVotes(getProvider());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**************************************************************************
	 **	This part is focused on retrieving the rewards informations for the
	 **	above gauges for a specific account, aka the connected one.
	 **************************************************************************/
	async function _getCurrentGaugeVotes(_provider, _address, _gauges) {
		const gaugeController = new ethers.Contract(
			CONST.GAUGE_CONTROLLER_ADDRESS,
			['function vote_user_slopes(address, address) public view returns (uint256 slope, uint256 power, uint256 end)'],
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

	// async function _getBribery(_provider, _address, _gauges, _rewardTokens, _rewardTokenAddress
	async function _getBribery(_provider, _gauges) {
		const briberies = [];
		const block = (await _provider.getBlock('latest')).number;
		const briberyV2 = new Contract(CONST.BRIBERY_ADDRESS_V2, ABI.BRIBERY_ABI);
		const briberyTokensContract = new Contract(CONST.BRIBERY_TOKENS_ADDRESS_V2, ABI.BRIBERY_ABI);
		const ethcallProvider = await newEthCallProvider(_provider);

		let	calls = [];
		for (let index = 0; index < DEFAULT_TOKENS.length; index++) {
			const token = DEFAULT_TOKENS[index];
			calls.push(briberyV2.gauges_per_reward(token.address));
		}
		const allGaugesPerRewardV2 = await ethcallProvider.tryAll(calls);

		calls = [];
		for (let index = 0; index < DEFAULT_TOKENS.length; index++) {
			const token = DEFAULT_TOKENS[index];
			const gaugesPerRewardV2 = allGaugesPerRewardV2[index];

			for (let index = 0; index < gaugesPerRewardV2.length; index++) {
				const gauge = gaugesPerRewardV2[index];
				calls.push(briberyV2.active_period(gauge, token.address));
				calls.push(briberyV2.claimable(address, gauge, token.address));
				calls.push(briberyV2.last_user_claim(address, gauge, token.address));
				calls.push(briberyTokensContract.tokens_for_bribe(address, gauge, token.address));
				calls.push(briberyV2.reward_per_token(gauge, token.address));	
			}
		}
		const results = await ethcallProvider.tryAll(calls);

		let rIndex = 0;
		for (let index = 0; index < DEFAULT_TOKENS.length; index++) {
			const token = DEFAULT_TOKENS[index];
			const gaugesPerRewardV2 = allGaugesPerRewardV2[index];
			for (let index = 0; index < gaugesPerRewardV2.length; index++) {
				const	gauge = gaugesPerRewardV2[index];
				const	activePeriod = results[rIndex++];
				const	claimable = results[rIndex++];
				const	lastUserClaim = results[rIndex++];
				const	tokensForBribe = results[rIndex++];
				const	rewardPerToken = results[rIndex++];
				briberies.push({
					version: 2,
					claimable,
					lastUserClaim,
					activePeriod,
					tokensForBribe,
					rewardPerToken,
					canClaim: ethers.BigNumber.from(block).lt(ethers.BigNumber.from(activePeriod).add(CONST.WEEK)),
					hasClaimed: ethers.BigNumber.from(lastUserClaim).eq(activePeriod),
					gauge: _gauges.filter(g => g.gaugeAddress.toLowerCase() === gauge.toLowerCase())[0],
					rewardToken: DEFAULT_TOKENS.filter(r => r.address.toLowerCase() === token.address.toLowerCase())[0]
				});
			}
			
		}
		return briberies;
	}

	async function getRewards() {
		if (!gauges || gauges.length === 0) {
			return null;
		}
		// console.log('Before _getCurrentGaugeVotes');
		const _gauges = await _getCurrentGaugeVotes(provider, address, gauges);
		// console.log('After _getCurrentGaugeVotes');

		// console.log('Before _getBribery');
		const	flatBriberies = await _getBribery(provider, _gauges);
		// console.log('After _getBribery');

		const rewards = [];
		for (let j = 0; j < flatBriberies.length; j++) {
			let bribe = flatBriberies[j];
			rewards.push({
				activePeriod: bribe.activePeriod,
				rewardsUnlock: ethers.BigNumber.from(bribe.activePeriod).add(CONST.WEEK).toNumber().toFixed(0),
				claimable: bribe.claimable,
				canClaim: bribe.canClaim,
				hasClaimed: bribe.hasClaimed,
				gauge: bribe.gauge,
				tokensForBribe: bribe.tokensForBribe,
				rewardPerToken: bribe.rewardPerToken,
				rewardToken: bribe.rewardToken,
				decimals: bribe.rewardToken.decimals
			});
		}
		set_rewards(rewards);
		// console.groupEnd('Get Rewards');
	}

	async function getVoteRewards() {
		if (!votes || votes.length === 0) {
			return null;
		}

		const voteBriberyContract = new Contract(CONST.VOTE_BRIBERY_ADDRESS, ABI.VOTE_BRIBERY_ABI);
		const votesSourceContract = new Contract(CONST.VOTE_SOURCE_ADDRESS, ABI.VOTE_SOURCE_ABI);
		const ethcallProvider = await newEthCallProvider(provider);

		const res = [];
		for (let index = 0; index < votes.length; index++) {
			const vote = votes[index];
			if (!vote.rewardsPerVote || vote.rewardsPerVote.length === 0) {
				continue;
			}
			const _rewards = [];
			const calls = [];

			for (let index = 0; index < (vote.rewardsPerVote).length; index++) {
				const rewardTokenAddress = (vote.rewardsPerVote)[index];
				const token = new Contract(rewardTokenAddress, ABI.ERC20_ABI);

				calls.push(voteBriberyContract.estimate_bribe(vote.index, rewardTokenAddress, address));
				calls.push(voteBriberyContract.reward_amount(vote.index, rewardTokenAddress));
				calls.push(votesSourceContract.getVoterState(vote.index, address));
				calls.push(voteBriberyContract.has_claimed(vote.index, rewardTokenAddress, address));
				calls.push(token.symbol());
				calls.push(token.decimals());
				calls.push(token.balanceOf(address));
			}
			const results = await ethcallProvider.tryAll(calls);

			let rIndex = 0;
			for (let index = 0; index < (vote.rewardsPerVote).length; index++) {
				const 	rewardTokenAddress = (vote.rewardsPerVote)[index];
				const	estimateBribe = results[rIndex++];
				const	rewardAmount = results[rIndex++];
				const	voterState = results[rIndex++];
				const	hsaClaimed = results[rIndex++];
				const	symbol = results[rIndex++];
				const	decimals = results[rIndex++];
				const	balance = results[rIndex++];

				_rewards.push({
					estimateBribe, //
					rewardAmount, //
					voterState,
					hsaClaimed,
					vote,
					decimals: decimals.toNumber(),
					rewardToken: {
						address: rewardTokenAddress,
						decimals: decimals.toNumber(),
						symbol,
						balance
					}
				});
			}
			// console.log(_rewards);
		}
		set_voteRewards(res);
	}

	useClientEffect(() => {
		if (!active) return;
		// console.group('Get Rewards');
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
