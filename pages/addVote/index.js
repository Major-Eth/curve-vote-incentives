import	React, {useState}	from	'react';
import	{ethers}			from	'ethers';
import	{useRouter}			from	'next/router';
import	* as moment			from	'moment';
import	Header				from	'components/header';
import	useGauges			from	'contexts/useGauges';
import	{formatCurrency}	from	'utils';

function Voting() {
	const router = useRouter();
	const {votes} = useGauges();
	const [search, setSearch] = useState('');

	return (
		<div className={'flex flex-col w-full h-full'}>
			<div className={'flex z-10 justify-between items-center w-full h-20 bg-white'}>
				<Header>
					<div className={'flex items-center mr-16 w-full'}>
						<input
							className={'pl-6 mr-6 w-full h-20 text-lg text-gray-blue-1 focus:outline-none'}
							placeholder={'Vote ID (1, 2, 61, etc.)'}
							value={search}
							onChange={e => setSearch(e.target.value)} />
						<svg
							className={'w-6 h-6 text-gray-blue-2'}
							xmlns={'http://www.w3.org/2000/svg'}
							viewBox={'0 0 512 512'}>
							<path d={'M504.1 471l-134-134C399.1 301.5 415.1 256.8 415.1 208c0-114.9-93.13-208-208-208S-.0002 93.13-.0002 208S93.12 416 207.1 416c48.79 0 93.55-16.91 129-45.04l134 134C475.7 509.7 481.9 512 488 512s12.28-2.344 16.97-7.031C514.3 495.6 514.3 480.4 504.1 471zM48 208c0-88.22 71.78-160 160-160s160 71.78 160 160s-71.78 160-160 160S48 296.2 48 208z'} fill={'currentColor'} />
						</svg>
					</div>
				</Header>
			</div>
			<div className={'flex relative flex-col justify-center items-center pt-16 text-center'}>
				<h2 className={'text-2xl font-bold text-dark-blue-1'}>{'Select a Proposal'}</h2>
				<p className={'text-base text-gray-blue-2'}>{'Choose a proposal that you would like to support below...'}</p>
			</div>
			
			<div className={'overflow-scroll pt-4 mt-6 w-full h-full'}>
				<div className={'grid grid-cols-12 py-4 px-8'}>
					<div className={'col-span-1'}>
						<p className={'text-xs font-bold text-gray-blue-2'}>{'Vote ID'}</p>
					</div>
					<div className={'col-span-5'}>
						<p className={'text-xs font-bold text-gray-blue-2'}>{'Votes'}</p>
					</div>
					<div className={'col-span-2'}>
						<p className={'text-xs font-bold text-gray-blue-2'}>{'Quorum'}</p>
					</div>
					<div className={'flex col-span-2 justify-end'}>
						<p className={'text-xs font-bold text-gray-blue-2'}>{'Vote Ends'}</p>
					</div>
					<div className={'flex col-span-2 justify-end'} />
				</div>

				<div className={'w-full'}>
					{
						votes && votes.length > 0 && votes.filter((vote) => {
							return vote.vote.open;
						}).filter((vote) => {
							if (search)
								return vote.index == search;
							return true;
						}).map((vote, index) => {
							const	yesPerc = (Number(vote.vote.yea) / (Number(vote.vote.yea) + Number(vote.vote.nay)));
							const	quorumPerc = (Number(vote.vote.yea) + Number(vote.vote.nay)) / (Number(vote.vote.votingPower));

							return (
								<div key={vote.index} className={`grid grid-cols-12 py-4 px-8 ${index % 2 ? 'bg-white-blue-2' : 'bg-white'}`}>
									<div
										className={'col-span-1 cursor-pointer'}
										onClick={() => window.open(`https://dao.curve.fi/vote/ownership/${vote.index}`, '_blank')}>
										<p className={'pl-4 text-base font-bold text-dark-blue-1'}>{vote.index}</p>
									</div>
									<div className={'col-span-5'}>
										<div className={'overflow-hidden relative mb-1 w-11/12 h-5 bg-yearn-blue-light-1 rounded-sm'}>
											<div className={'absolute inset-y-0 left-0 h-full bg-yearn-blue'} style={{width: `${yesPerc}%`}}></div>
											<div className={'absolute inset-y-0 w-0.5 h-full bg-dark-blue-3'} style={{left: `${ethers.utils.formatUnits(vote.vote.supportRequired, 16)}%`}}></div>
										</div>
										<p className={'text-sm font-bold tracking-tight text-dark-blue-1'}>{`Yea ${formatCurrency(yesPerc)} %`}</p>
									</div>
									<div className={'col-span-2'}>
										<div className={'overflow-hidden relative mb-1 w-11/12 h-5 bg-yearn-blue-light-1 rounded-sm'}>
											<div className={'absolute inset-y-0 left-0 h-full bg-yearn-blue'} style={{width: `${quorumPerc}%`}}></div>
											<div className={'absolute inset-y-0 w-0.5 h-full bg-dark-blue-3'} style={{left: `${ethers.utils.formatUnits(vote.vote.minAcceptQuorum, 16)}%`}}></div>
										</div>
										<p className={'text-sm font-bold tracking-tight text-dark-blue-1'}>{`${formatCurrency(quorumPerc)} %`}</p>
									</div>
									<div className={'col-span-2 justify-end text-right'}>
										<p className={'text-sm font-bold tracking-tight text-dark-blue-1'}>
											{moment(vote.vote.timestamp).add(1, 'w').format('MMMM Do YYYY')}
										</p>
									</div>
									<div className={'flex col-span-2 justify-end'}>
										<button
											onClick={() => router.push(`/addVote/${vote.index}`)}
											className={'button button-outline'}>
											<p className={'text-sm'}>{'Choose Proposal'}</p>
										</button>
									</div>
								</div>
							);
						})
					}
				</div>
			</div>
		</div>
	);
}

export default Voting;
