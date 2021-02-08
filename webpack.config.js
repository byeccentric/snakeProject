const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const NODE_ENV = process.env.NODE_ENV;

module.exports = {
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            components: path.join(__dirname, 'src/components/'),
            types: path.join(__dirname, 'src/types/'),
            hooks: path.join(__dirname, 'src/hooks/'),
            utils: path.join(__dirname, 'src/utils/'),
            constants: path.join(__dirname, 'src/constants/'),
        },
    },
    mode: NODE_ENV ? NODE_ENV : 'development',
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
    },
    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                use: ['ts-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
        })
    ],
    devServer: {
        port: 3000,
        open: true,
        hot: true,
    },
    devtool: 'source-map'
}