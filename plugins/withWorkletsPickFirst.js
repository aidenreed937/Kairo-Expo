/**
 * Expo Config Plugin to add pickFirst rule for libworklets.so
 *
 * This resolves the conflict between react-native-reanimated and react-native-worklets
 * which both provide libworklets.so native library.
 */
const { withAppBuildGradle } = require('@expo/config-plugins');

const withWorkletsPickFirst = (config) => {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Check if pickFirst for libworklets.so already exists
    if (buildGradle.includes("'**/libworklets.so'")) {
      return config;
    }

    // Find the packagingOptions block and add pickFirst rule
    const packagingOptionsRegex =
      /packagingOptions\s*\{[\s\S]*?jniLibs\s*\{[\s\S]*?useLegacyPackaging[^\n]*/;

    if (packagingOptionsRegex.test(buildGradle)) {
      config.modResults.contents = buildGradle.replace(
        packagingOptionsRegex,
        (match) =>
          `${match}\n            // Resolve duplicate libworklets.so from react-native-reanimated and react-native-worklets\n            pickFirsts += ['**/libworklets.so']`
      );
    }

    return config;
  });
};

module.exports = withWorkletsPickFirst;
