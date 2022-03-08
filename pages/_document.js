// /* eslint-disable react/jsx-filename-extension */
// import React from 'react';
// import Document, {Html, Head, Main, NextScript} from 'next/document';
// import {ServerStyleSheets} from '@material-ui/core/styles';

// export default class MyDocument extends Document {
// 	render() {
// 		return (
// 			<Html lang={'en'}>
// 				<Head>
// 					<link rel={'stylesheet'} href={'/fonts/Inter/inter.css'} />
// 					<link rel={'stylesheet'} href={'/fonts/Druk/Druk.css'} />
// 					<link rel={'stylesheet'} href={'/fonts/GrtskGiga/stylesheet.css'} />
// 				</Head>
// 				<body>
// 					<Main />
// 					<NextScript />
// 				</body>
// 			</Html>
// 		);
// 	}
// }

// // MyDocument.getInitialProps = async ctx => {
// // 	const sheets = new ServerStyleSheets();
// // 	const originalRenderPage = ctx.renderPage;

// // 	ctx.renderPage = () =>
// // 		originalRenderPage({
// // 			enhanceApp: App => props => sheets.collect(<App {...props} />)
// // 		});

// // 	const initialProps = await Document.getInitialProps(ctx);

// // 	return {
// // 		...initialProps,
// // 		styles: [
// // 			...React.Children.toArray(initialProps.styles),
// // 			sheets.getStyleElement()
// // 		]
// // 	};
// // };



import React from 'react';
import Document, {Html, Head, Main, NextScript} from 'next/document';

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		return {...initialProps};
	}

	render() {
		return (
			<Html lang={'en'}>
				<Head />
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;