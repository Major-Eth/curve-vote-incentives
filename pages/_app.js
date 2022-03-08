import  React       		from	'react';
import  Head				from	'next/head';
import	{ethers}			from	'ethers';
import	{Web3ReactProvider}	from	'@web3-react/core';
import	{Web3ContextApp}	from	'contexts/useWeb3';
import	{RewardsContextApp}	from	'contexts/useRewards';
import 'styles/global.css';


function AppWrapper(props) {
	const	{Component, pageProps} = props;

	return (
		<React.Fragment>
			<Head>
				<title>{'bribe.crv.finance'}</title>
				<meta name={'viewport'} content={'minimum-scale=1, initial-scale=1, width=device-width'} />
				<link rel={'icon'} href={'/favicon.jpg'} />
				<meta name={'description'} content={'bribe.crv.finance'} />
				<meta name={'og:title'} content={'bribe.crv.finance'} />
				<meta name={'twitter:card'} content={'summary_large_image'} />
				<link rel={'preconnect'} href={'https://fonts.googleapis.com'} />
				<link rel={'preconnect'} href={'https://fonts.gstatic.com'} crossOrigin={'true'} />
				<link href={'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;600;700&display=swap'} rel={'stylesheet'} />
				<meta name={'robots'} content={'index,nofollow'} />
				<meta name={'googlebot'} content={'index,nofollow'} />
			</Head>
			<main id={'app'}>
				<Web3ReactProvider getLibrary={getLibrary}>
					<Component
						element={props.element}
						router={props.router}
						{...pageProps} />
				</Web3ReactProvider>
			</main>
		</React.Fragment>
	);
}

const getLibrary = (provider) => {
	return new ethers.providers.Web3Provider(provider, 'any');
};

function	MyApp(props) {
	const	{Component, pageProps} = props;
  
	return (
		<Web3ReactProvider getLibrary={getLibrary}>
			<Web3ContextApp>
				<RewardsContextApp>
					<AppWrapper
						Component={Component}
						pageProps={pageProps}
						element={props.element}
						router={props.router} />
				</RewardsContextApp>
			</Web3ContextApp>
		</Web3ReactProvider>
	);
}

export default MyApp;