module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // NativeWind must be first to process CSS before Expo
      'nativewind/babel',
      'babel-preset-expo',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@app': './src/app',
            '@core': './src/core',
            '@features': './src/features',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      // Reanimated plugin has to be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};
