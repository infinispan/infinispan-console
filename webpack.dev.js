const path = require('path');
const {merge} = require("webpack-merge");
const common = require("./webpack.common.js");
const { stylePaths } = require("./stylePaths");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "9000";

module.exports = merge(common('development'), {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    host: HOST,
    port: PORT,
    compress: true,
    historyApiFallback: {
      index:'/console/'
    },
    hot: true,
    open: true,
    open: 'console',
    static: {
      serveIndex: true,
      directory: "./dist"
    },
    client: {
      overlay: true
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          ...stylePaths
        ],
        use: ["style-loader", "css-loader"]
      }
    ]
  }
});
