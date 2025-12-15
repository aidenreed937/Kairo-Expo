// Mock for react-native-worklets/plugin
// This is needed because some versions of react-native-reanimated
// may try to resolve this module during Jest tests
module.exports = function () {
  return {};
};
