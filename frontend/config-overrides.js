const { override } = require('customize-cra');

module.exports = {
  webpack: override(
    // webpack config overrides can be added here
  ),
  devServer: (configFunction) => {
    return (proxy, allowedHost) => {
      const config = configFunction(proxy, allowedHost);
      config.allowedHosts = ['localhost'];
      return config;
    };
  },
};