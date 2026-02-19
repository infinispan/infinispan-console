/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { stylePaths } = require('./stylePaths');
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '9000';

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    host: HOST,
    port: PORT,
    compress: true,
    historyApiFallback: {
      index:'/console/'
    },
    open: 'console',
    static: [
      {
        serveIndex: true,
        directory: path.resolve(__dirname, 'dist'),
      },
      {
        directory: path.resolve(__dirname, 'src/proto'),
        publicPath: '/console/proto',
      }
    ],
    client: {
      overlay: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      // Serve .proto files with correct MIME type
      devServer.app.get('*.proto', (req, res, next) => {
        res.type('text/plain; charset=utf-8');
        next();
      });
      return middlewares;
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [...stylePaths],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  output: {
    publicPath: '/console/', // allows using '/console' url
  },
});
