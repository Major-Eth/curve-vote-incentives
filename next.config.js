const Dotenv = require('dotenv-webpack');

module.exports = {
	plugins: [new Dotenv()],
	images: {
		domains: ['rawcdn.githack.com', 'raw.githubusercontent.com']
	},
	env: {
		ALCHEMY_KEY: process.env.ALCHEMY_KEY,
		INITIAL_VOTE_INDEX: 120
	}
};
