module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    assumptions: {
      "setPublicClassFields": true,
      "privateFieldsAsProperties": true
    },
    plugins: [
      'react-native-reanimated/plugin',
      ['@babel/plugin-proposal-decorators', { "legacy": true }],
    ]
  };
};
