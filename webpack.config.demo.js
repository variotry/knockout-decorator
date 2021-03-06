﻿const webpack = require( 'webpack' );

module.exports = {
	entry: "./demo/ts/demo.ts",
	output: {
		filename: 'demo.js',
		path: __dirname + "/demo/js/",
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "awesome-typescript-loader",
			},
			{
				test: /\.js$/,
				loader: "source-map-loader"
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'commons',
			filename: 'commons.js',
			minChunks: 2
		} )
	]
};