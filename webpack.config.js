const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')

var outputFileName = 'vaslapp-dt-schema';
var libraryName = 'schema';
let pathsToClean = ['dist']

let cleanOptions = {}



module.exports = env => {


    // Use env.<YOUR VARIABLE> here:
    console.log('NODE_ENV: ', env.NODE_ENV) // 'local'
    console.log('Production: ', env.production) // true

    let isProduction = env.production;

    if (isProduction) {
        outputFile = outputFileName + '.min.js';
    } else {
        outputFile = outputFileName + '.js';
    }


    return {
        entry: ['./src/js/index.js'],
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: outputFile,
            library: libraryName,
            libraryTarget: 'umd',
            // umdNamedDefine: true
        },
        module: {
            rules: [{
                    test: /\.js?$/,
                    exclude: /(node_modules|bower_components)/,
                    // loader: 'file-loader',
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ["es2015", "stage-0"]
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    use: ExtractTextPlugin.extract({
                        // fallback: 'style-loader',
                        use: [{
                            loader: 'css-loader',
                            options: {
                                url: true,
                                minimize: true,
                                sourceMap: true
                            }
                        }, {
                            loader: 'sass-loader',
                            options: {
                                url: false,
                                sourceMap: true
                            }
                        }]
                    })
                },
                {
                    test: /\.(jpe?g|png|gif|svg|eot|svg|ttf|woff|woff2)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        useRelativePath: true
                    }
                },
                {
                    test: /\.handlebars$/,
                    exclude: /(node_modules|bower_components\/)/,
                    use: [{
                        loader: 'handlebars-loader',
                    }]
                },
                {
                    test: /\.(html)$/,
                    use: {
                        loader: 'html-loader',
                        options: {
                            attrs: [':data-src']
                        }
                    }
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(isProduction ? pathsToClean : [], cleanOptions),
            new ExtractTextPlugin({
                // filename: "style.css?[hash]-[chunkhash]-[contenthash]-[name]",
                filename: outputFileName + ".css?[hash]-[chunkhash]",
                disable: false,
                // allChunks: true
            }),
            new webpack.LoaderOptionsPlugin({
                options: {
                    handlebarsLoader: {}
                }
            }),
            new UglifyJsPlugin({
                sourceMap: true
            })
        ],
        // ADD
        devServer: {
            contentBase: './',
            port: 3003,
        },
        node: {
            fs: 'empty'
        },
        resolve: {
            alias: {
                handlebars: 'handlebars/dist/handlebars.min.js',
                'medium-editor': 'medium-editor/dist/js/medium-editor.min.js',
                $: 'jquery/dist/jquery.slim.min.js',
                bootstrap: 'bootstrap/dist/bootstrap.min.js'
            }
        }
    }
};