require('./.env');

import path from 'path';

// @ts-ignore
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// @ts-ignore
import HtmlWebpackPlugin from 'html-webpack-plugin';
// @ts-ignore
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const devServerPort = process.env.SERVER_PORT || 8000;
const analyzerPort = process.env.ANALYZER_PORT || 8888;
const isProduction = process.env.NODE_ENV === 'production';
const generateStaticAnalyzer = !!process.env.ANALYZER;

const getAbsPath = (pathStr: string) => path.resolve(__dirname, pathStr);

export default {
  mode: isProduction ? 'production' : 'development',
  target: 'electron-renderer',
  entry: {
    app: getAbsPath('src/renderer/app/app.tsx')
  },
  output: {
    path: getAbsPath('dist'),
    filename: isProduction ? '[name].bundle.[chunkhash].js' : '[name].bundle.js',

    // Prefix path for all the relative-url assets required inside the source code.
    // Eg. if you have a .css file that has background-image: url('a.png') <<Nno absolute path>>
    // and your public path is set to http://cdn.example.com, the bundled
    // file will have background-image: url(http://cdn.example.com/a.png).

    // TODO: webpack default is '' but i have to explicitely set it to './'
    // because of a webfonts-loader issue
    // https://github.com/jeerbl/webfonts-loader/issues/28
    publicPath: './'
  },
  devtool: isProduction ? 'source-map' : 'cheap-eval-source-map',
  devServer: {
    publicPath: '/', // Necessary for index.html to work
    inline: false, // Don't inject livereload code
    host: '127.0.0.1', // Needed too
    port: devServerPort,
    historyApiFallback: true,
  },

  module: {
    rules: [
      // TypeScript
      { test: /\.tsx?$/,
        use: ['ts-loader']
      },

      // Scss
      {
        test: /\.s?css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },

      // Images
      {
        test: /\.(png|jpg|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: isProduction ? '[name].[hash].[ext]' : '[name].[ext]'
          }
        }
      },

      // Svg iconfonts
      {
        test: /[\\\/]_fonts[\\\/].*[\\\/]font\.js$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          { loader: 'css-loader', options: { url: false } },
          'webfonts-loader'
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: getAbsPath('src/renderer/app/app.html'),
    }),

    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      ...generateStaticAnalyzer ?
      {
        analyzerMode: 'static',
        reportFilename: 'webpack-bundle-analyzer.html',
      }
      :
      {
        analyzerMode: 'server',
        analyzerPort
      }
    }),

    ...isProduction ?
    [
      // contentash is the file's checksum, useful for caching purposes
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css'
      })
    ]
    :
    []
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],

    // Where to look when using things like "import 'lodash';"
    modules: [getAbsPath('src/renderer'), getAbsPath('node_modules')]
  }
};
