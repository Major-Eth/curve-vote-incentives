import	React, {useState, useEffect}	from 'react';
import	{ethers}				from	'ethers';
import	* as moment				from	'moment';
import	Header					from	'components/header';
import	RewardCard				from	'components/RewardCard';
import	VoteRewardCard			from	'components/VoteRewardCard';
import	WalletSelection			from	'components/WalletSelection';
import	useWeb3					from	'contexts/useWeb3';
import	useGauges				from	'contexts/useGauges';

function Voting() {
	const	{active} = useWeb3();
	const	{rewards, voteRewards} = useGauges();
	const	[search, setSearch] = useState('');
	const	[rewardsByType, set_rewardsByType] = useState({claimable: [], potential: []});
	const	[voteRewardsByType, set_voteRewardsByType] = useState({claimable: [], potential: []});

	const onSearchChanged = (event) => {
		setSearch(event.target.value);
	};

	useEffect(() => {
		const _claimable = rewards
			.filter(r => search === '' ? true : (r?.rewardToken?.address || '').toLowerCase() === search.toLowerCase())
			.filter((reward) => Number(reward.claimable) > 0);
		const _potential = rewards
			.filter(r => search === '' ? true : (r?.rewardToken?.address || '').toLowerCase() === search.toLowerCase())
			.filter((reward) => Number(reward.claimable) === 0 && ethers.BigNumber.from(reward.rewardsUnlock).gt(moment().unix()))
			.sort((a, b) => {
				if (Number(a.tokensForBribe) > Number(b.tokensForBribe))
					return -1;
				if (Number(a.tokensForBribe) < Number(b.tokensForBribe))
					return 1;
				return 0;
			});
		set_rewardsByType({claimable: _claimable, potential: _potential});
	}, [rewards, search]);


	useEffect(() => {
		const _claimable = voteRewards.filter((reward) => reward.voterState === 1 && reward.vote.vote.open !== true);
		const _potential = voteRewards.filter((reward) => reward.vote.vote.open === true)
			.sort((a, b) => {
				if (ethers.BigNumber.from(a.estimateBribe).gt(b.estimateBribe))
					return -1;
				if (ethers.BigNumber.from(a.estimateBribe).lt(b.estimateBribe))
					return 1;
				return 0;
			});
		set_voteRewardsByType({claimable: _claimable, potential: _potential});
	}, [voteRewards]);

	if (!active) {
		return (
			<div>
				<div className={'flex flex-col items-center px-28 mt-48 w-full h-full'}>
					<p className={'text-2xl font-semibold'}>{'Connect your wallet to find your rewards.'}</p>
					<WalletSelection />
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className={'flex sticky top-0 z-10 justify-between items-center w-full h-20 bg-white'}>
				<Header>
					<div className={'flex justify-end items-center mr-16 w-full'}>
						<input
							className={'pl-6 mr-6 w-full h-20 text-lg text-gray-blue-1 focus:outline-none'}
							placeholder={'Reward Token Address (eg. 0x6b1754....1d0f)'}
							value={search}
							onChange={onSearchChanged} />
						<svg
							className={'w-6 h-6 text-gray-blue-2'}
							xmlns={'http://www.w3.org/2000/svg'}
							viewBox={'0 0 512 512'}>
							<path d={'M504.1 471l-134-134C399.1 301.5 415.1 256.8 415.1 208c0-114.9-93.13-208-208-208S-.0002 93.13-.0002 208S93.12 416 207.1 416c48.79 0 93.55-16.91 129-45.04l134 134C475.7 509.7 481.9 512 488 512s12.28-2.344 16.97-7.031C514.3 495.6 514.3 480.4 504.1 471zM48 208c0-88.22 71.78-160 160-160s160 71.78 160 160s-71.78 160-160 160S48 296.2 48 208z'} fill={'currentColor'} />
						</svg>
					</div>
				</Header>
			</div>
			{
				(
					!rewardsByType?.claimable?.length && !voteRewardsByType?.length && !rewardsByType?.potential?.length && !voteRewardsByType?.potential?.length) && search === '' && (
					<section className={'px-20 mt-10'}>
						<p className={'text-base text-dark-blue-1'}>{'Loading Rewards:'}</p>
						<div className={'grid grid-cols-3 gap-8 mt-4'}>
							<div className={'flex flex-col items-center py-6 px-4 h-80 bg-white rounded-md shadow-sm animate-pulse'} />
							<div className={'flex flex-col items-center py-6 px-4 h-80 bg-white rounded-md shadow-sm animate-pulse'} />
							<div className={'flex flex-col items-center py-6 px-4 h-80 bg-white rounded-md shadow-sm animate-pulse'} />

							<div className={'flex flex-col items-center py-6 px-4 h-80 bg-white rounded-md shadow-sm animate-pulse'} />
							<div className={'flex flex-col items-center py-6 px-4 h-80 bg-white rounded-md shadow-sm animate-pulse'} />
							<div className={'flex flex-col items-center py-6 px-4 h-80 bg-white rounded-md shadow-sm animate-pulse'} />
						</div>
					</section>
				)
			}
			{
				(
					!rewardsByType?.claimable?.length && !voteRewardsByType?.length && !rewardsByType?.potential?.length && !voteRewardsByType?.potential?.length) && search !== '' && (
					<section className={'px-20 mt-10'}>
						<p className={'text-base text-dark-blue-1'}>{'No result'}</p>
					</section>
				)
			}
			{
				(rewardsByType.claimable.length > 0 || voteRewardsByType.length > 0) && (
					<section className={'px-20 mt-10'}>
						<p className={'text-base text-dark-blue-1'}>{'Claimable Rewards:'}</p>
						<div className={'grid grid-cols-3 gap-8 mt-4'}>
							{
								(rewardsByType.claimable || []).map((reward, idx) => {
									return <RewardCard reward={ reward } key={ idx } />;
								})
							}
							{
								(voteRewardsByType.claimable || [])?.map((reward, idx) => {
									return <VoteRewardCard reward={ reward } key={ idx } />;
								})
							}
						</div>
					</section>
				)
			}
			{
				(rewardsByType.potential.length > 0 || voteRewardsByType.potential.length > 0) && (
					<section className={'px-20 mt-10'}>
						<p className={'text-base text-dark-blue-1'}>{'Upcoming Rewards:'}</p>
						<div className={'grid grid-cols-1 gap-8 mt-4 md:grid-cols-2 xl:grid-cols-3'}>
							{
								rewardsByType.potential.map((reward, idx) => {
									return <RewardCard reward={ reward } key={ idx } />;
								})
							}
							{
								voteRewardsByType.potential.map((reward, idx) => {
									return <VoteRewardCard reward={ reward } key={ idx } />;
								})
							}
						</div>
					</section>
				)}
		</div>
	);
}

export default Voting;
