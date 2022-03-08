import	React, {useState}	from	'react';
import	PieChartIcon		from	'@material-ui/icons/PieChart';
import	{ethers}			from	'ethers';
import	BigNumber			from	'bignumber.js';
import	* as moment			from	'moment';
import	{formatCurrency}	from	'utils';
import	useWeb3				from	'contexts/useWeb3';

import	{BRIBERY_ADDRESS_V2, BRIBERY_ADDRESS}		from	'stores/constants';

export default function RewardCard({reward}) {
	const	{provider} = useWeb3();
	const	[claiming, setClaiming] = useState(false);

	async function _callClaimReward(gauge, rewardToken, version) {
		const	signer = provider.getSigner();
		const	bribery = new ethers.Contract(version === 1 ? BRIBERY_ADDRESS : BRIBERY_ADDRESS_V2, ['function claim_reward(address, address) public'], signer);
		const	transaction = await bribery.claim_reward(gauge, rewardToken);
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 1) {
			return true;
		} else {
			return false;
		}
	}

	const onClaim = () => {
		if(!claiming) {
			_callClaimReward(reward?.gauge?.gaugeAddress, reward?.rewardToken?.address, reward.version).then(() => setClaiming(false));
		}
	};

	const renderClaimable = () => {
		return (
			<>
				<p className={'pt-8 text-xs text-gray-blue-1'}>{'Amount claimable:'}</p>
				<p className={'my-3 text-3xl font-bold text-dark-blue-1'} >
					{formatCurrency(Number(reward.claimable))} {reward.rewardToken.symbol}
				</p>
				<p className={'pb-8 text-xs text-center text-gray-blue-1'}>
					{`Your reward for voting for ${reward.gauge.name}`}
				</p>
				{
					reward.hasClaimed && (
						<button disabled className={'mt-auto button button-filled-alt'}>
							{'Reward Claimed'}
						</button>
					)}
				{
					!reward.hasClaimed && (
						<button className={'mt-auto button button-filled-alt'} onClick={onClaim} disabled={claiming}>
							{claiming ? 'Claiming ...' : 'Claim Reward'}
						</button>
					)}
			</>
		);
	};

	const renderAvailable = () => {
		return (
			<>
				<p className={'pt-8 text-xs text-gray-blue-1'}>{'Current receive amount:'}</p>
				<p className={'my-3 text-3xl font-bold text-dark-blue-1'} >
					{formatCurrency(BigNumber(reward.tokensForBribe).times(reward.gauge.votes.userVoteSlopePercent).div(100))} {reward.rewardToken.symbol}
				</p>
				<p className={'text-xs text-center text-gray-blue-1'}>
					{`100% vote for ${reward.gauge.name} gives you ${formatCurrency(reward.tokensForBribe)} ${reward.rewardToken.symbol}`}
				</p>
				<p className={'py-8 mt-auto text-xs text-center text-gray-blue-1'}>
					{`Unlocks ${moment.unix(reward.rewardsUnlock).fromNow()}`}
				</p>
				<button
					className={'button button-filled-alt'}
					onClick={() => window.open('https://dao.curve.fi/gaugeweight')}>
					{'Cast Vote'}
				</button>
			</>
		);
	};

	return (
		<div
			key={reward.id}
			className={'flex flex-col items-center py-6 px-4 bg-white rounded-md shadow-sm'}>
			<PieChartIcon className={'p-2 text-white bg-[#0053FF] rounded-full shadow-sm'} style={{width: 64, height: 64}} />
			{Number(reward.claimable) >= 0 ? renderClaimable() : renderAvailable()}
		</div>
	);
}
