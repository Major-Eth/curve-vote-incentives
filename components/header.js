import	React, {useState}	from	'react';
import	Unlock				from	'./unlock';
import	{truncateAddress}	from	'utils';
import	useWeb3				from	'contexts/useWeb3';

function Header(props) {
	const	{address, active} = useWeb3();
	const [unlockOpen, setUnlockOpen] = useState(false);

	const onAddressClicked = () => {
		if (!active) {
			setUnlockOpen(true);
		}
	};

	const closeUnlock = () => {
		setUnlockOpen(false);
	};


	if(props.variant === 2) {
		return (
			<div className={'flex justify-end items-center w-full h-full'}>
				<button
					className={'p-2 w-36 h-full font-bold text-center text-white bg-yearn-blue hover:bg-yearn-blue-dark transition-colors'}
					onClick={props.backClicked}>
					<p className={'text-sm'}>{'Back'}</p>
				</button>
				<div className={'flex'} />
				<button
					className={'p-2 w-36 h-full font-bold text-center text-white bg-yearn-blue hover:bg-yearn-blue-dark transition-colors'}
					onClick={onAddressClicked}>
					<p className={'text-sm'}>{address ? truncateAddress(address) : 'Connect Wallet'}</p>
				</button>
				{unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}
			</div>
		);
	}

	return (
		<div className={'flex justify-end items-center h-full'}>
			<button
				className={'p-2 w-36 h-full font-bold text-center text-white bg-yearn-blue hover:bg-yearn-blue-dark transition-colors'}
				onClick={onAddressClicked}>
				<h5 className={'text-base'}>{address ? truncateAddress(address) : 'Connect Wallet'}</h5>
			</button>
			{unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}
		</div>
	);
}

export default Header;
