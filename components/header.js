import React, {useState} from 'react';
import {useRouter} from 'next/router';
import {truncateAddress} from 'utils';
import useWeb3 from 'contexts/useWeb3';
import WalletSelection from 'components/WalletSelection';
import {Dialog, Transition} from '@headlessui/react';

function Modal({open, set_open}) {
	const walletConnectRef = React.useRef();

	return (
		<Transition.Root show={open} as={React.Fragment}>
			<Dialog
				as={'div'}
				static
				className={'overflow-y-auto fixed inset-0 z-10'}
				style={{zIndex: 9999999}}
				initialFocus={walletConnectRef}
				open={open}
				onClose={set_open}
			>
				<div
					className={
						'flex justify-center items-end px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0'
					}
				>
					<Transition.Child
						as={React.Fragment}
						enter={'ease-out duration-300'}
						enterFrom={'opacity-0'}
						enterTo={'opacity-100'}
						leave={'ease-in duration-200'}
						leaveFrom={'opacity-100'}
						leaveTo={'opacity-0'}
					>
						<Dialog.Overlay
							className={
								'fixed inset-0 z-10 bg-dark-blue-1/50 transition-opacity'
							}
							onClick={() => set_open(false)}
						/>
					</Transition.Child>

					<Transition.Child
						as={React.Fragment}
						enter={'ease-out duration-300'}
						enterFrom={
							'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
						}
						enterTo={'opacity-100 translate-y-0 sm:scale-100'}
						leave={'ease-in duration-200'}
						leaveFrom={'opacity-100 translate-y-0 sm:scale-100'}
						leaveTo={
							'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
						}
					>
						<div
							className={
								'inline-block overflow-hidden relative z-20 px-8 pb-10 mt-24 w-full text-left align-bottom bg-white-blue-1 rounded-lg shadow-xl transition-all md:max-w-4xl'
							}
						>
							<WalletSelection onClick={() => set_open(false)} />
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

function Header(props) {
	const router = useRouter();
	const {address} = useWeb3();
	const [unlockOpen, setUnlockOpen] = useState(false);

	const onAddressClicked = () => {
		setUnlockOpen(true);
	};

	return (
		<div className={'flex items-center w-full h-full'}>
			{router.asPath !== '/' ? (
				<button
					className={
						'p-2 w-36 h-full font-bold text-center text-dark-blue-1 bg-white hover:bg-white-blue-1 border-r border-r-white-blue-1 transition-colors'
					}
					onClick={() => router.push('/')}
				>
					<p className={'text-sm'}>{'Home'}</p>
				</button>
			) : null}
			{props.children}
			<button
				className={
					'p-2 w-36 h-full font-bold text-center text-white bg-yearn-blue hover:bg-yearn-blue-dark transition-colors'
				}
				onClick={onAddressClicked}
			>
				<h5 className={'text-base'}>
					{address ? truncateAddress(address) : 'Connect Wallet'}
				</h5>
			</button>
			{unlockOpen && <Modal open={unlockOpen} set_open={setUnlockOpen} />}
		</div>
	);
}

export default Header;
