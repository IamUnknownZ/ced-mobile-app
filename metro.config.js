const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
// R3F's CommonJS entry imports Three with require(). Three's CommonJS wrapper
// calls Node's process.emitWarning, which is not available in React Native.
// Resolve both imports to the same ESM build so Three is loaded only once.
const threeModule = path.join(path.dirname(require.resolve('three')), 'three.module.js');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') return { type: 'sourceFile', filePath: threeModule };
  return context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
