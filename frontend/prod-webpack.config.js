var webpackConfig = require('./webpack.config.js');
var path = require("path");
var LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
var ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
var DefinePlugin = require("webpack/lib/DefinePlugin");
var NormalModuleReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;
var CopyWebpackPlugin = require('copy-webpack-plugin');

webpackConfig.plugins = [
    new CopyWebpackPlugin([
        { from: path.join(__dirname, 'node_modules', 'bootstrap', 'less'), to: path.join(__dirname, "web", "client", "dist", "bootstrap", "less") }
    ]),
    new LoaderOptionsPlugin({
        debug: false,
        options: {
            postcss: {
                plugins: [
                  require('postcss-prefix-selector')({prefix: '.ms2', exclude: ['.ms2', '[data-ms2-container]', /\[decat-toc-container\]/]})
                ]
            },
            context: __dirname
        }
    }),
    new DefinePlugin({
        "__DEVTOOLS__": false
    }),
    new DefinePlugin({
      'process.env': {
        'NODE_ENV': '"production"'
      }
    }),
    new NormalModuleReplacementPlugin(/leaflet$/, path.join(__dirname, "MapStore2", "web", "client", "libs", "leaflet")),
    new NormalModuleReplacementPlugin(/openlayers$/, path.join(__dirname, "MapStore2", "web", "client", "libs", "openlayers")),
    new NormalModuleReplacementPlugin(/proj4$/, path.join(__dirname, "MapStore2", "web", "client", "libs", "proj4")),
    new NormalModuleReplacementPlugin(/CatalogUtils.js/, path.join(__dirname, "js", "ms2override", "GeoNodeCatalogUtils.js")),
    new NormalModuleReplacementPlugin(/\/Title.jsx/, path.join(__dirname, "js", "ms2override", "TitleSubTitle.jsx")),
    new NormalModuleReplacementPlugin(/LayersUtils.js/, path.join(__dirname, "js", "ms2override", "GeoNodeLayersUtils.js")),
    new ParallelUglifyPlugin({
        uglifyJS: {
            sourceMap: false,
            compress: {warnings: false},
            mangle: true
        }
    }),
    extractThemesPlugin
];
webpackConfig.devtool = undefined;

// this is a workaround for this issue https://github.com/webpack/file-loader/issues/3
// use `__webpack_public_path__` in the index.html when fixed
webpackConfig.output.publicPath = "/static/decat/";

module.exports = webpackConfig;
