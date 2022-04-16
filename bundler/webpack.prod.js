const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WebpackObfuscator = require('webpack-obfuscator')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(
    commonConfiguration,
    {
        mode: 'production',
        devtool: false,
        plugins: [
            new WebpackObfuscator({
                rotateStringArray: true,
                reservedStrings: ['\s*']
            }),
            new CleanWebpackPlugin()
        ],
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            comments: false
                        }
                    }
                })
            ]
        },
        module: {
            rules: [
                {
                    enforce: 'post',
                    use: [
                        {
                            loader: WebpackObfuscator.loader,
                            options: {
                                rotateStringArray: true,
                                reservedStrings: ['\s*']
                            }
                        }
                    ]
                }
            ]
        }
    }
)
