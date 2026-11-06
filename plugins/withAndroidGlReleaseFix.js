const { withGradleProperties } = require('expo/config-plugins');

// SDK 58 expo-gl 58.0.3 can lose its view constructor when R8 minifies release builds.
// Keep this in Expo config so the setting survives a clean EAS prebuild.
module.exports = function withAndroidGlReleaseFix(config) {
  return withGradleProperties(config, (result) => {
    for (const key of ['android.enableMinifyInReleaseBuilds', 'android.enableShrinkResourcesInReleaseBuilds']) {
      const entry = result.modResults.find((item) => item.type === 'property' && item.key === key);
      if (entry) entry.value = 'false';
      else result.modResults.push({ type: 'property', key, value: 'false' });
    }
    return result;
  });
};
