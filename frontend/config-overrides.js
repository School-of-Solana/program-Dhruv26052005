const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify"),
    "url": require.resolve("url"),
    "vm": false
  });
  config.resolve.fallback = fallback;
  
  // Add alias for process
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': path.resolve(__dirname, 'node_modules/process/browser.js'),
    'process': path.resolve(__dirname, 'node_modules/process/browser.js')
  };
  
  // Fix for ESM modules requiring fully specified imports
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false
    }
  });
  
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ]);
  
  config.ignoreWarnings = [/Failed to parse source map/];
  return config;
}
