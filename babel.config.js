module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@navigation': './src/navigation',
            '@theme': './src/theme/index',
            '@assets': './src/assets',
            '@types': './src/types',
            '@config': './src/config',
            '@constants': './src/constants',
            '@models': './src/models',
            '@contexts': './src/contexts',
          },
        },
      ],
      [
        'module:react-native-dotenv',
        {
          moduleName: 'react-native-dotenv',
          path: '.env',
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
