// module.exports = {
//   webpack: (config, { isServer }) => {
//     // Fixes npm packages that depend on `fs` module
//     if (!isServer) {
//       config.node = {
//         fs: 'empty'
//       }
//     }

//     return config
//   }
// }

const Dotenv = require('dotenv-webpack');

module.exports = ({
	plugins: [new Dotenv()],
	images: {
		domains: [
			'rawcdn.githack.com'
		],
	},
	env: {
		ALCHEMY_KEY: process.env.ALCHEMY_KEY,
	}
});
