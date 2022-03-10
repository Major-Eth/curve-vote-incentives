import React, {useState, useContext, createContext, useCallback} from 'react';
import {ethers} from 'ethers';
import QRCodeModal from '@walletconnect/qrcode-modal';
import {useWeb3React} from '@web3-react/core';
import {InjectedConnector} from '@web3-react/injected-connector';
import {WalletConnectConnector} from '@web3-react/walletconnect-connector';
import {WalletLinkConnector} from '@web3-react/walletlink-connector';
import {FortmaticConnector} from '@web3-react/fortmatic-connector';
import {PortisConnector} from '@web3-react/portis-connector';
import useLocalStorage from 'hooks/useLocalStorage';
import useClientEffect from 'hooks/useClientEffect';
import useWindowInFocus from 'hooks/useWindowInFocus';
import useDebounce from	'hooks/useDebounce';
import {toAddress} from 'utils';
import performBatchedUpdates from 'utils/performBatchedUpdates';

const walletType = {
	NONE: -1,
	METAMASK: 0,
	WALLET_CONNECT: 1,
	TRUSTWALLET: 2,
	COINBASE: 3,
	FORTMATIC: 4,
	PORTIS: 5
};
const Web3Context = createContext();

function getProvider(chain = 'ethereum') {
	if (chain === 'ethereum') {
		return new ethers.providers.AlchemyProvider(
			'homestead',
			process.env.ALCHEMY_KEY
		);
	} else if (chain === 'fantom') {
		return new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools');
	} else if (chain === 'major') {
		return new ethers.providers.JsonRpcProvider('http://localhost:8545');
	}
	return new ethers.providers.AlchemyProvider(
		'homestead',
		process.env.ALCHEMY_KEY
	);
}

export const Web3ContextApp = ({children}) => {
	const   web3 = useWeb3React();
	const   {activate, active, library, account, chainId, deactivate} = web3;
	const   [ens, set_ens] = useLocalStorage('ens', '');
	const   [lastWallet, set_lastWallet] = useLocalStorage('lastWallet', walletType.NONE);
	const   [disconnected, set_disconnected] = useState(false);
	const	[disableAutoChainChange, set_disableAutoChainChange] = useState(false);
	const	debouncedChainID = useDebounce(chainId, 500);
	const	windowInFocus = useWindowInFocus();

	const onSwitchChain = useCallback((force) => {
		if (!force && (!active || disableAutoChainChange)) {
			return;
		}
		const	isCompatibleChain = (Number(debouncedChainID) === 1 || Number(debouncedChainID) === 1337 || Number(debouncedChainID) === 31337);
		if (isCompatibleChain) {
			return;
		}
		if (!library || !active) {
			console.error('Not initialized');
			return;
		}
		library
			.send('wallet_switchEthereumChain', [{chainId: '0x1'}])
			.catch(() => set_disableAutoChainChange(true));
	}, [active, disableAutoChainChange, debouncedChainID, library]);

	React.useEffect(() => {
		onSwitchChain();
	}, [windowInFocus, onSwitchChain]);


	/**************************************************************************
	 **	connect
	 **	What should we do when the user choose to connect it's wallet ?
	 **	Based on the providerType (AKA Metamask or WalletConnect), differents
	 **	actions should be done.
	 **	Then, depending on the providerType, a similar action, but different
	 **	code is executed to set :
	 **	- The provider for the web3 actions
	 **	- The current address/account
	 **	- The current chain
	 **	Moreover, we are starting to listen to events (disconnect, changeAccount
	 **	or changeChain).
	 **************************************************************************/
	const connect = useCallback(
		async (_providerType, callback = () => null) => {
			if (_providerType === walletType.METAMASK) {
				if (active) {
					deactivate();
				}
				const injected = new InjectedConnector();
				activate(injected, undefined, true);
				set_lastWallet(walletType.METAMASK);
				callback();
			} else if (_providerType === walletType.WALLET_CONNECT) {
				if (active) {
					deactivate();
				}
				const walletconnect = new WalletConnectConnector({
					rpc: {
						1: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`
					},
					bridge: 'https://bridge.walletconnect.org',
					pollingInterval: 12000,
					qrcodeModal: QRCodeModal,
					qrcode: true
				});
				try {
					await activate(walletconnect, undefined, true);
					set_lastWallet(walletType.WALLET_CONNECT);
					callback();
				} catch (error) {
					console.error(error);
					set_lastWallet(walletType.NONE);
				}
			} else if (_providerType === walletType.TRUSTWALLET) {
				if (active) {
					deactivate();
				}
				const injected = new InjectedConnector();
				activate(injected, undefined, true);
				set_lastWallet(walletType.TRUSTWALLET);
				callback();
			} else if (_providerType === walletType.COINBASE) {
				if (active) {
					deactivate();
				}
				const walletlink = new WalletLinkConnector({
					url: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
					appName: 'veToken'
				});
				try {
					await activate(walletlink, undefined, true);
					set_lastWallet(walletType.COINBASE);
					callback();
				} catch (error) {
					console.error(error);
					set_lastWallet(walletType.NONE);
				}
			} else if (_providerType === walletType.FORTMATIC) {
				if (active) {
					deactivate();
				}
				const fortmatic = new FortmaticConnector({
					apiKey: 'pk_live_F95FEECB1BE324B5',
					chainId: 1
				});
				try {
					await activate(fortmatic, undefined, true);
					set_lastWallet(walletType.FORTMATIC);
					callback();
				} catch (error) {
					console.error(error);
					set_lastWallet(walletType.NONE);
				}
			} else if (_providerType === walletType.PORTIS) {
				if (active) {
					deactivate();
				}
				const portis = new PortisConnector({
					dAppId: '5dea304b-33ed-48bd-8f00-0076a2546b60',
					networks: [1, 100]
				});
				try {
					await activate(portis, undefined, true);
					set_lastWallet(walletType.PORTIS);
					callback();
				} catch (error) {
					console.error(error);
					set_lastWallet(walletType.NONE);
				}
			}
		},
		[activate, active]
	);

	useClientEffect(() => {
		if (!active && lastWallet !== walletType.NONE) {
			connect(lastWallet);
		}
	}, [active]);

	useClientEffect(() => {
		if (account) {
			getProvider()
				.lookupAddress(toAddress(account))
				.then((_ens) => set_ens(_ens || ''));
		}
	}, [account]);

	return (
		<Web3Context.Provider
			value={{
				address: account,
				connect,
				deactivate,
				walletType,
				chainID: Number(chainId || 0),
				active:
					active &&
					(Number(chainId) === 1 ||
						Number(chainId) === 1337 ||
						Number(chainId) === 31337),
				provider: library,
				getProvider,
				ens,
				onDesactivate: () => {
					performBatchedUpdates(() => {
						set_lastWallet(walletType.NONE);
						set_disconnected(true);
					});
					setTimeout(() => set_disconnected(false), 100);
				},
				disconnected
			}}
		>
			{children}
		</Web3Context.Provider>
	);
};

export const useWeb3 = () => useContext(Web3Context);
export default useWeb3;
