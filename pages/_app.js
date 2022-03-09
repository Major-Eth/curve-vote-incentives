import React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {ethers} from 'ethers';
import {Web3ReactProvider} from '@web3-react/core';
import useWeb3, {Web3ContextApp} from 'contexts/useWeb3';
import {GaugesContextApp} from 'contexts/useGauges';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import 'styles/global.css';

function Layout(props) {
	const {Component, pageProps} = props;
	const {active} = useWeb3();
	const router = useRouter();

	return (
		<div className={'grid relative grid-cols-12'}>
			<div
				className={
					'col-span-4 min-h-full 2xl:col-span-4 withBackgroundImage'
				}
			>
				<div
					className={
						'flex flex-col gap-2.5 justify-center items-center pt-20 h-[100vh] xl:pt-40'
					}
				>
					<div className={'px-8 mx-auto w-full 2xl:px-0 2xl:w-3/4'}>
						<h1
							className={
								'text-5xl font-bold text-white whitespace-pre xl:text-7xl'
							}
						>
							{'CRV Vote\nIncentives'}
						</h1>
						<h2
							className={
								'flex flex-row items-center pt-8 text-2xl font-light text-white xl:text-4xl'
							}
						>
							{'Get more for your votes! '}
							<ThumbUpIcon
								className={'ml-2'}
								style={{
									color: '#FFD764',
									width: '2rem',
									height: '2rem'
								}}
							/>
						</h2>
						<div
							className={
								'my-6 border-b border-white/40 xl:mt-10 xl:mb-12'
							}
						/>
						<p
							className={
								'mt-6 mb-10 text-lg font-light text-white xl:text-xl'
							}
						>
							{
								'Add a reward to a pool which will be distributed proportionally to everyone who votes for it.'
							}
						</p>
						{active && (
							<div
								className={
									'flex flex-col justify-between space-y-8 w-full 2xl:flex-row 2xl:space-y-0'
								}
							>
								<button
									className={'w-44 button button-filled'}
									onClick={() => router.push('/add')}
								>
									<p
										className={
											'text-base text-dark-blue-3 uppercase'
										}
									>
										{'Add Gauge Bribe'}
									</p>
								</button>
								<button
									className={'w-44 button button-filled'}
									onClick={() => router.push('/addVote')}
								>
									<p
										className={
											'text-base text-dark-blue-3 uppercase'
										}
									>
										{'Add Vote Bribe'}
									</p>
								</button>
							</div>
						)}
					</div>
					<div
						className={
							'py-16 px-8 mt-auto w-full text-white bg-white/40 lg:px-28'
						}
					>
						<a
							className={'flex items-start'}
							href={
								'https://github.com/Major-Eth/vote-incentives'
							}
							target={'_blank'}
							rel={'noopener noreferrer'}
						>
							<svg
								version={'1.1'}
								width={'24'}
								height={'24'}
								viewBox={'0 0 24 24'}
							>
								<path
									fill={'currentcolor'}
									d={
										'M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z'
									}
								/>
							</svg>
							<div className={'pl-2 text-left'}>
								<p className={'mb-1 text-base font-bold'}>
									{'View Source Code'}
								</p>
								<p className={'text-sm'}>{'Version 1.1.6'}</p>
							</div>
						</a>
					</div>
				</div>
			</div>
			<div
				className={
					'overflow-scroll col-span-8 h-[100vh] 2xl:col-span-8'
				}
			>
				<Component
					element={props.element}
					router={props.router}
					{...pageProps}
				/>
			</div>
		</div>
	);
}

function AppWrapper(props) {
	return (
		<React.Fragment>
			<Head>
				<title>{'bribe.crv.finance'}</title>
				<meta
					name={'viewport'}
					content={
						'minimum-scale=1, initial-scale=1, width=device-width'
					}
				/>
				<link rel={'icon'} href={'/favicon.jpg'} />
				<meta name={'description'} content={'bribe.crv.finance'} />
				<meta name={'og:title'} content={'bribe.crv.finance'} />
				<meta name={'twitter:card'} content={'summary_large_image'} />
				<link
					rel={'preconnect'}
					href={'https://fonts.googleapis.com'}
				/>
				<link
					rel={'preconnect'}
					href={'https://fonts.gstatic.com'}
					crossOrigin={'true'}
				/>
				<meta name={'robots'} content={'index,nofollow'} />
				<meta name={'googlebot'} content={'index,nofollow'} />
			</Head>
			<main id={'app'}>
				<Layout {...props} />
			</main>
		</React.Fragment>
	);
}

const getLibrary = (provider) => {
	return new ethers.providers.Web3Provider(provider, 'any');
};

function MyApp(props) {
	const {Component, pageProps} = props;

	return (
		<Web3ReactProvider getLibrary={getLibrary}>
			<Web3ContextApp>
				<GaugesContextApp>
					<AppWrapper
						Component={Component}
						pageProps={pageProps}
						element={props.element}
						router={props.router}
					/>
				</GaugesContextApp>
			</Web3ContextApp>
		</Web3ReactProvider>
	);
}

export default MyApp;
