import	React, {useState, useEffect}	from 'react';
import	{useRouter}				from	'next/router';
import	{ethers}				from	'ethers';
import	* as moment				from	'moment';
import	Header					from	'components/header';
import	RewardCard				from	'components/rewardCard';
import	VoteRewardCard			from	'components/voteRewardCard';
import	ThumbUpIcon				from	'@material-ui/icons/ThumbUp';
import	Image					from	'next/image';
import	useWeb3					from	'contexts/useWeb3';
import	useRewards				from	'contexts/useRewards';

function WalletSelection() {
	const	{connect, walletType} = useWeb3();

	return (
		<div className={'grid grid-cols-3 gap-4 mt-10'}>
			<div
				onClick={() => connect(walletType.METAMASK)}
				className={'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'}>
				<Image src={'/connectors/icn-metamask.svg'} width={52} height={52} />
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>{'Metamask'}</p>
				<p className={'text-sm text-gray-blue-1'}>{'Connect to your MetaMask wallet'}</p>
			</div>

			<div
				onClick={() => connect(walletType.TRUSTWALLET)}
				className={'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'}>
				<Image src={'/connectors/trustWallet.png'} width={52} height={52} />
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>{'TrustWallet'}</p>
				<p className={'text-sm text-gray-blue-1'}>{'Connect to your TrustWallet'}</p>
			</div>

			<div
				onClick={() => connect(walletType.WALLET_CONNECT)}
				className={'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'}>
				<Image src={'/connectors/walletConnectIcon.svg'} width={52} height={52} />
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>{'WalletConnect'}</p>
				<p className={'text-sm text-gray-blue-1'}>{'Scan with WalletConnect to connect'}</p>
			</div>

			<div
				onClick={() => connect(walletType.COINBASE)}
				className={'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'}>
				<Image src={'/connectors/coinbaseWalletIcon.svg'} width={52} height={52} />
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>{'Coinbase Wallet'}</p>
				<p className={'text-sm text-gray-blue-1'}>{'Connect to your Coinbase wallet'}</p>
			</div>

			<div
				onClick={() => connect(walletType.FORTMATIC)}
				className={'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'}>
				<Image src={'/connectors/fortmaticIcon.png'} width={52} height={52} />
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>{'Fortmatic'}</p>
				<p className={'text-sm text-gray-blue-1'}>{'Connect with your Fortmatic account'}</p>
			</div>

			<div
				onClick={() => connect(walletType.PORTIS)}
				className={'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'}>
				<Image src={'/connectors/portisIcon.png'} width={52} height={52} />
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>{'Portis'}</p>
				<p className={'text-sm text-gray-blue-1'}>{'Connect with your Portis account'}</p>
			</div>
		</div>
	);
}

function Voting() {
	const	router = useRouter();
	const	{provider, address, active} = useWeb3();
	const	{rewards} = useRewards();
	const	[search, setSearch] = useState('');
	const	[voteRewards, setVoteRewards] = useState([]);
	const	[rewardsByType, set_rewardsByType] = useState({claimable: [], potential: []});
	const	[voteRewardsByType, set_voteRewardsByType] = useState({claimable: [], potential: []});

	const onSearchChanged = (event) => {
		setSearch(event.target.value);
	};

	const onSearch = (event) => {
		if (event.keyCode === 13) {
			// setRewards([]);
			// setVoteRewards([]);
			// stores.dispatcher.dispatch({type: GET_INCENTIVES_BALANCES, content: {address: search}});
		}

	};

	useEffect(() => {
		const _claimable = rewards.filter((reward) => Number(reward.claimable) > 0);
		const _potential = rewards.filter((reward) => Number(reward.claimable) === 0 && ethers.BigNumber.from(reward.rewardsUnlock).gt(moment().unix()))
			.sort((a, b) => {
				if (Number(a.tokensForBribe) > Number(b.tokensForBribe))
					return -1;
				if (Number(a.tokensForBribe) < Number(b.tokensForBribe))
					return 1;
				return 0;
			});
		set_rewardsByType({claimable: _claimable, potential: _potential});
	}, [rewards]);


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

	return (
		<div className={'grid relative grid-cols-12'}>
			<div className={'col-span-5 min-h-full withBackgroundImage'}>
				<div className={'flex flex-col gap-2.5 justify-center items-center pt-40 h-[100vh]'}>
					<div className={'px-28 mx-auto w-full'}>
						<h1 className={'text-7xl font-bold text-white'}>
							{'CRV Vote Incentives'}
						</h1>
						<h2 className={'flex flex-row items-center pt-8 text-4xl font-light text-white'}>
							{'Get more for your votes! '}<ThumbUpIcon className={'ml-2'} style={{color: '#FFD764', width: '2rem', height: '2rem'}} />
						</h2>
						<div className={'mt-10 mb-12 border-b border-white/40'} />
						<p className={'mt-6 mb-10 text-xl font-light text-white'}>
							{'Add a reward to a pool which will be distributed proportionally to everyone who votes for it.'}
						</p>
						{
							active && (
								<div className={'flex justify-between w-full'}>
									<button className={'button button-filled'} onClick={() => router.push('/add')}>
										<p className={'text-base text-dark-blue-3 uppercase'}>{'Add Gauge Bribe'}</p>
									</button>
									<button className={'button button-filled'} onClick={() => router.push('/addVote')}>
										<p className={'text-base text-dark-blue-3 uppercase'}>{'Add Vote Bribe'}</p>
									</button>
								</div>
							)
						}
					</div>
					<div className={'py-16 px-28 mt-auto w-full text-white bg-white/40'}>
						<a className={'flex items-start'} href={'https://github.com/antonnell/vote-incentives'} target={'_blank'} rel={'noopener noreferrer'} >
							<svg version={'1.1'} width={'24'} height={'24'} viewBox={'0 0 24 24'}>
								<path fill={'currentcolor'} d={'M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z'} />
							</svg>
							<div className={'pl-2 text-left'}>
								<p className={'mb-1 text-base font-bold'}>{'View Source Code'}</p>
								<p className={'text-sm'}>{'Version 1.1.6'}</p>
							</div>
						</a>
					</div>
				</div>
			</div>
			<div className={'col-span-7'}>
				{
					!active && (
						<div className={'flex flex-col items-center px-28 mt-48 w-full h-full'}>
							<p className={'text-2xl font-semibold'}>{'Connect your wallet to find your rewards.'}</p>
							<WalletSelection />
						</div>
					)
				}
				{
					active && (
						<>
							<div className={'flex sticky top-0 z-10 justify-between items-center w-full h-20 bg-white'}>
								<div className={'flex justify-end items-center mr-16 w-full'}>
									<input
										className={'pl-6 mr-6 w-full h-20 text-lg text-gray-blue-1 focus:outline-none'}
										placeholder={'Reward Token Address (eg. 0x6b1754....1d0f)'}
										value={search}
										onChange={onSearchChanged}
										onKeyDown={onSearch} />
									<svg
										onClick={() => onSearch({keyCode: 13})}
										className={'w-6 h-6 text-gray-blue-2 hover:text-gray-blue-1 transition-colors cursor-pointer'}
										xmlns={'http://www.w3.org/2000/svg'}
										viewBox={'0 0 512 512'}>
										<path d={'M504.1 471l-134-134C399.1 301.5 415.1 256.8 415.1 208c0-114.9-93.13-208-208-208S-.0002 93.13-.0002 208S93.12 416 207.1 416c48.79 0 93.55-16.91 129-45.04l134 134C475.7 509.7 481.9 512 488 512s12.28-2.344 16.97-7.031C514.3 495.6 514.3 480.4 504.1 471zM48 208c0-88.22 71.78-160 160-160s160 71.78 160 160s-71.78 160-160 160S48 296.2 48 208z'} fill={'currentColor'} />
									</svg>
								</div>
								<Header />
							</div>
							{
								(
									!rewardsByType?.claimable?.length && !voteRewardsByType?.length && !rewardsByType?.potential?.length && !voteRewardsByType?.potential?.length) && (
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
								(rewardsByType.claimable.length > 0 || voteRewardsByType.length > 0) && (
									<section className={'px-20 mt-10'}>
										<p className={'text-base text-dark-blue-1'}>{'Claimable Rewards:'}</p>
										<div className={'grid grid-cols-3 gap-8 mt-4'}>
											{
												rewardsByType.claimable.map((reward, idx) => {
													return <RewardCard reward={ reward } key={ idx } />;
												})
											}
											{
												voteRewardsByType.map((reward, idx) => {
													return <VoteRewardCard reward={ reward } key={ idx } />;
												})
											}
										</div>
									</section>
								)}
							{
								(rewardsByType.potential.length > 0 || voteRewardsByType.potential.length > 0) && (
									<section className={'px-20 mt-10'}>
										<p className={'text-base text-dark-blue-1'}>{'Upcoming Rewards:'}</p>
										<div className={'grid grid-cols-3 gap-8 mt-4'}>
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
						</>
					)}
			</div>
		</div>
	);
}

export default Voting;
