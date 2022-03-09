import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Image from 'next/image';
import {ethers} from 'ethers';
import Header from 'components/header';
import useGauges from 'contexts/useGauges';
import useWeb3 from 'contexts/useWeb3';
import * as CONST from 'utils/constants';
import * as ABI from 'utils/abis';
import {formatCurrency, isAddress, truncateAddress} from 'utils';

function NetworkIcon({network}) {
	if (network === 'Ethereum') {
		return (
			<Image
				className={'w-10 min-w-[40px] max-w-[40px] h-10'}
				src={'/network_eth.png'}
				width={40}
				height={40}
			/>
		);
	} else if (network === 'Fantom') {
		return (
			<Image
				className={'w-10 min-w-[40px] max-w-[40px] h-10'}
				src={'/network_ftm.svg'}
				width={40}
				height={40}
			/>
		);
	} else if (network === 'Gnosis Chain (xDai)') {
		return (
			<Image
				className={'w-10 min-w-[40px] max-w-[40px] h-10'}
				src={'/network_gnosis.png'}
				width={40}
				height={40}
			/>
		);
	} else if (network === 'Polygon') {
		return (
			<Image
				className={'w-10 min-w-[40px] max-w-[40px] h-10'}
				src={'/network_polygon.svg'}
				width={40}
				height={40}
			/>
		);
	}
	return (
		<div
			className={
				'w-10 min-w-[40px] h-10 min-h-[40px] bg-gray-blue-3 rounded-full border border-gray-blue-2'
			}
		/>
	);
}

function TokenIcon({address}) {
	if (address) {
		return (
			<Image
				className={'w-8 min-w-[32px] h-8 min-h-[32px]'}
				src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ethers.utils.getAddress(
					address || ''
				)}/logo.png`}
				width={32}
				height={32}
			/>
		);
	}
	return (
		<div
			className={
				'w-8 min-w-[32px] h-8 min-h-[32px] bg-gray-blue-3 rounded-full border border-gray-blue-2'
			}
		/>
	);
}

function Voting() {
	const {provider, address} = useWeb3();
	const {gauges} = useGauges();
	const router = useRouter();

	const [gauge, set_gauge] = useState(false);
	const [loading, setLoading] = useState(false);
	const [searching, setSearching] = useState(false);
	const [rewardTokenAddress, setRewardTokenAddress] = useState('');
	const [rewardAmount, setRewardAmount] = useState('');
	const [rewardToken, setRewardToken] = useState();

	useEffect(() => {
		if (gauges)
			set_gauge(
				gauges.find((g) => g.gaugeAddress === router.query.address)
			);
	}, [gauges, router.query.address]);

	const onRewardAmountChanged = (e) => setRewardAmount(e.target.value);

	async function _callAddReward(_rewardToken, _rewardAmount, _gauge) {
		const signer = provider.getSigner();
		const signerAddress = await signer.getAddress();
		const sendAmount = ethers.utils.parseUnits(
			_rewardAmount,
			_rewardToken.decimals
		);
		const tokenContract = new ethers.Contract(
			_rewardToken.address,
			ABI.ERC20_ABI,
			signer
		);
		const allowance = await tokenContract.allowance(
			signerAddress,
			CONST.BRIBERY_ADDRESS_V2
		);
		if (sendAmount.gt(allowance)) {
			try {
				const approveTransaction = await tokenContract.approve(
					CONST.BRIBERY_ADDRESS_V2,
					sendAmount
				);
				const approveTransactionResult =
					await approveTransaction.wait();
				if (approveTransactionResult.status !== 1) {
					setLoading(false);
					return false;
				}
			} catch (e) {
				setLoading(false);
				return false;
			}
		}

		const bribery = new ethers.Contract(
			CONST.BRIBERY_ADDRESS_V2,
			['function add_reward_amount(address, address, uint) public'],
			signer
		);
		try {
			const transaction = await bribery.add_reward_amount(
				_gauge.gaugeAddress,
				_rewardToken.address,
				sendAmount
			);
			const transactionResult = await transaction.wait();
			setLoading(false);
			if (transactionResult.status === 1) {
				onSearch();
				setRewardAmount(0);
				return true;
			} else {
				setLoading(false);
				return false;
			}
		} catch (e) {
			setLoading(false);
			return false;
		}
	}
	function onSubmit() {
		setLoading(true);
		_callAddReward(rewardToken, rewardAmount, gauge);
	}

	async function onSearch() {
		setSearching(true);
		try {
			const token = new ethers.Contract(
				rewardTokenAddress,
				ABI.ERC20_ABI,
				provider
			);
			const [symbol, decimals, balance] = await Promise.all([
				token.symbol(),
				token.decimals(),
				token.balanceOf(address)
			]);
			console.log({symbol, decimals, balance});
			setRewardToken({
				address: rewardTokenAddress,
				symbol,
				decimals: parseInt(decimals),
				balance
			});
			setSearching(false);
		} catch (ex) {
			setRewardToken();
			setSearching(false);
			return;
		}
	}

	return (
		<div>
			<div
				className={
					'flex z-10 justify-between items-center w-full h-20 bg-white'
				}
			>
				<Header>
					<div className={'flex items-center mr-16 w-full'}>
						<div
							className={
								'pl-6 mr-6 w-full h-20 text-lg text-gray-blue-1 focus:outline-none'
							}
						/>
					</div>
				</Header>
			</div>
			<div
				className={
					'flex relative flex-col justify-center items-center pt-16 text-center'
				}
			>
				<h2 className={'text-2xl font-bold text-dark-blue-1'}>
					{'Define the Reward'}
				</h2>
				<p className={'text-base text-gray-blue-2'}>
					{
						'Add reward token address & specify the amount to be rewarded...'
					}
				</p>
			</div>

			<div className={'flex pt-10 w-full'}>
				<div
					className={
						'flex flex-col p-4 mx-auto w-2/3 max-w-xl bg-white rounded-md shadow-sm'
					}
				>
					<div className={'flex flex-row'}>
						<div>
							<NetworkIcon network={gauge.gaugeTypeName} />
						</div>
						<div className={'pl-4'}>
							<p
								className={
									'mb-1 text-base font-bold text-dark-blue-1'
								}
							>
								{gauge?.name || ''}
							</p>
							<p
								className={
									'mb-1 text-sm font-bold tabular-nums text-dark-blue-1'
								}
							>
								{truncateAddress(gauge?.gaugeAddress || '')}
							</p>
						</div>
					</div>
					<div className={'pt-8 w-full'}>
						<label className={'text-sm font-bold text-dark-blue-1'}>
							{'Add Reward Token Address:'}
						</label>
						<div className={'flex flex-row space-x-2'}>
							<input
								className={
									'p-2 w-full text-lg text-gray-blue-1 rounded-md border border-gray-blue-3 focus:outline-none'
								}
								placeholder={'0x00000000000000'}
								value={rewardTokenAddress}
								onChange={(e) =>
									setRewardTokenAddress(e.target.value)
								}
							/>
							<button
								disabled={
									searching || !isAddress(rewardTokenAddress)
								}
								onClick={() =>
									searching || !isAddress(rewardTokenAddress)
										? null
										: onSearch()
								}
								className={'w-33 button button-filled-alt'}
							>
								<p className={'text-sm'}>{'Search'}</p>
							</button>
						</div>
					</div>
					<div className={'pt-8 w-full'}>
						<div
							className={
								'flex flex-row justify-between items-center'
							}
						>
							<label
								className={'text-sm font-bold text-dark-blue-1'}
							>
								{'Total Reward Tokens On Offer:'}
							</label>
							<div
								className={
									'flex flex-row items-center text-sm text-gray-blue-2'
								}
							>
								<p>{'Available: '}</p>
								<p
									className={'pl-1 font-bold cursor-pointer'}
									onClick={() =>
										onRewardAmountChanged({
											target: {
												value: ethers.utils.formatUnits(
													rewardToken.balance,
													rewardToken.decimals
												)
											}
										})
									}
								>
									{rewardToken &&
										formatCurrency(
											ethers.utils.formatUnits(
												rewardToken?.balance,
												rewardToken?.decimals
											)
										)}
								</p>
							</div>
						</div>
						<div
							className={
								'flex flex-row p-2 space-x-2 w-full text-lg text-gray-blue-1 rounded-md border border-gray-blue-3 focus:outline-none'
							}
						>
							<div className={'w-8 min-w-[32px] h-8'}>
								<TokenIcon
									address={rewardToken?.address || ''}
								/>
							</div>
							<input
								className={
									'w-full text-lg text-gray-blue-1 focus:outline-none'
								}
								placeholder={'0.00'}
								value={rewardAmount}
								disabled={!rewardToken}
								onChange={onRewardAmountChanged}
							/>
						</div>
					</div>
					<div className={'pt-16'}>
						<button
							className={'w-full button button-filled-alt'}
							onClick={onSubmit}
							disabled={loading || !rewardToken || !rewardAmount}
						>
							<p>{loading ? 'Submitting ...' : 'Submit'}</p>
						</button>
					</div>
					<p
						className={
							'pt-2 text-xs italic text-center text-dark-blue-1'
						}
					>
						{'Rewards are valid for 7 days from time created'}
					</p>
				</div>
			</div>
		</div>
	);
}

export default Voting;
