import React from 'react';
import Image from 'next/image';
import useWeb3 from 'contexts/useWeb3';

function WalletSelection({onClick = () => null}) {
	const {connect, walletType} = useWeb3();

	return (
		<div className={'grid grid-cols-3 gap-4 mt-10'}>
			<div
				onClick={() => connect(walletType.METAMASK, onClick)}
				className={
					'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'
				}
			>
				<Image
					src={'/connectors/icn-metamask.svg'}
					width={52}
					height={52}
				/>
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>
					{'Metamask'}
				</p>
				<p className={'text-sm text-gray-blue-1'}>
					{'Connect to your MetaMask wallet'}
				</p>
			</div>

			<div
				onClick={() => connect(walletType.TRUSTWALLET, onClick)}
				className={
					'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'
				}
			>
				<Image
					src={'/connectors/trustWallet.png'}
					width={52}
					height={52}
				/>
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>
					{'TrustWallet'}
				</p>
				<p className={'text-sm text-gray-blue-1'}>
					{'Connect to your TrustWallet'}
				</p>
			</div>

			<div
				onClick={() => connect(walletType.WALLET_CONNECT, onClick)}
				className={
					'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'
				}
			>
				<Image
					src={'/connectors/walletConnectIcon.svg'}
					width={52}
					height={52}
				/>
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>
					{'WalletConnect'}
				</p>
				<p className={'text-sm text-gray-blue-1'}>
					{'Scan with WalletConnect to connect'}
				</p>
			</div>

			<div
				onClick={() => connect(walletType.COINBASE, onClick)}
				className={
					'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'
				}
			>
				<Image
					src={'/connectors/coinbaseWalletIcon.svg'}
					width={52}
					height={52}
				/>
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>
					{'Coinbase Wallet'}
				</p>
				<p className={'text-sm text-gray-blue-1'}>
					{'Connect to your Coinbase wallet'}
				</p>
			</div>

			<div
				onClick={() => connect(walletType.FORTMATIC, onClick)}
				className={
					'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'
				}
			>
				<Image
					src={'/connectors/fortmaticIcon.png'}
					width={52}
					height={52}
				/>
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>
					{'Fortmatic'}
				</p>
				<p className={'text-sm text-gray-blue-1'}>
					{'Connect with your Fortmatic account'}
				</p>
			</div>

			<div
				onClick={() => connect(walletType.PORTIS, onClick)}
				className={
					'flex flex-col items-center py-14 px-8 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer'
				}
			>
				<Image
					src={'/connectors/portisIcon.png'}
					width={52}
					height={52}
				/>
				<p className={'my-2.5 text-lg font-bold text-dark-blue-1'}>
					{'Portis'}
				</p>
				<p className={'text-sm text-gray-blue-1'}>
					{'Connect with your Portis account'}
				</p>
			</div>
		</div>
	);
}

export default WalletSelection;
