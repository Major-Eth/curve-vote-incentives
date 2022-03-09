import React, {useState} from 'react';
import {useRouter} from 'next/router';
import Image from 'next/image';
import Header from 'components/header';
import useGauges from 'contexts/useGauges';

function NetworkIcon({network}) {
	if (network === 'Ethereum') {
		return <Image src={'/network_eth.png'} width={40} height={40} />;
	} else if (network === 'Fantom') {
		return <Image src={'/network_ftm.svg'} width={40} height={40} />;
	} else if (network === 'Gnosis Chain (xDai)') {
		return <Image src={'/network_gnosis.png'} width={40} height={40} />;
	} else if (network === 'Polygon') {
		return <Image src={'/network_polygon.svg'} width={40} height={40} />;
	}
	return (
		<div
			className={
				'w-10 h-10 bg-gray-blue-3 rounded-full border border-gray-blue-2'
			}
		/>
	);
}

function Voting() {
	const router = useRouter();
	const {gauges} = useGauges();
	const [search, setSearch] = useState('');

	const onSearchChanged = (event) => {
		setSearch(event.target.value);
	};

	return (
		<div className={'flex flex-col w-full h-full'}>
			<div
				className={
					'flex z-10 justify-between items-center w-full h-20 bg-white'
				}
			>
				<Header>
					<div className={'flex items-center mr-16 w-full'}>
						<input
							className={
								'pl-6 mr-6 w-full h-20 text-lg text-gray-blue-1 focus:outline-none'
							}
							placeholder={
								'Gauge Name, Address or LP Token Address (eg. 0x6b1754....1d0f)'
							}
							value={search}
							onChange={onSearchChanged}
						/>
						<svg
							className={'w-6 h-6 text-gray-blue-2'}
							xmlns={'http://www.w3.org/2000/svg'}
							viewBox={'0 0 512 512'}
						>
							<path
								d={
									'M504.1 471l-134-134C399.1 301.5 415.1 256.8 415.1 208c0-114.9-93.13-208-208-208S-.0002 93.13-.0002 208S93.12 416 207.1 416c48.79 0 93.55-16.91 129-45.04l134 134C475.7 509.7 481.9 512 488 512s12.28-2.344 16.97-7.031C514.3 495.6 514.3 480.4 504.1 471zM48 208c0-88.22 71.78-160 160-160s160 71.78 160 160s-71.78 160-160 160S48 296.2 48 208z'
								}
								fill={'currentColor'}
							/>
						</svg>
					</div>
				</Header>
			</div>

			<div
				className={
					'flex relative flex-col justify-center items-center pt-16 text-center'
				}
			>
				<h2 className={'text-2xl font-bold text-dark-blue-1'}>
					{'Select a Pool'}
				</h2>
				<p className={'text-base text-gray-blue-2'}>
					{
						'Choose a pool that you would like to offer rewards for below...'
					}
				</p>
			</div>
			<div className={'overflow-scroll pt-4 mt-6 w-full h-full'}>
				<div className={'grid grid-cols-12 py-4 px-8'}>
					<div className={'col-span-8'}>
						<p className={'text-xs font-bold text-gray-blue-2'}>
							{'Pool'}
						</p>
					</div>
					<div className={'flex col-span-2 justify-center'}>
						<p className={'text-xs font-bold text-gray-blue-2'}>
							{'Chain'}
						</p>
					</div>
					<div className={'flex col-span-2 justify-end'} />
				</div>
				<div className={'w-full'}>
					{gauges &&
						gauges.length > 0 &&
						gauges
							.filter((gauge) => {
								if (search) {
									return (
										gauge.name
											.toLowerCase()
											.includes(search.toLowerCase()) ||
										gauge.gaugeAddress
											.toLowerCase()
											.includes(search.toLowerCase()) ||
										gauge.lpTokenAddress
											.toLowerCase()
											.includes(search.toLowerCase())
									);
								}
								return true;
							})
							.map((gauge, index) => {
								return (
									<div
										key={`${gauge.name}_${index}`}
										className={`grid grid-cols-12 py-4 px-8 ${
											index % 2
												? 'bg-white-blue-2'
												: 'bg-white'
										}`}
									>
										<div
											className={
												'flex flex-row col-span-8 items-center'
											}
										>
											<NetworkIcon
												network={gauge.gaugeTypeName}
											/>
											<p
												className={
													'pl-4 text-base font-bold text-dark-blue-1'
												}
											>
												{gauge.name}
											</p>
										</div>
										<div
											className={
												'flex col-span-2 justify-center items-center'
											}
										>
											<p
												className={
													'text-sm font-bold tracking-tight text-dark-blue-1'
												}
											>
												{gauge.gaugeTypeName}
											</p>
										</div>
										<div
											className={
												'flex col-span-2 justify-end'
											}
										>
											<button
												onClick={() =>
													router.push(
														`/add/${gauge.gaugeAddress}`
													)
												}
												className={
													'button button-outline'
												}
											>
												<p className={'text-sm'}>
													{'Choose Pool'}
												</p>
											</button>
										</div>
									</div>
								);
							})}
				</div>
			</div>
		</div>
	);
}

export default Voting;
