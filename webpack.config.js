module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/env",
                {
                  targets: "> 0.25%, not dead",
                  useBuiltIns: "usage",
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.(csv|txt)$/,
        use: {
          loader: "raw-loader",
        },
      },
    ],
  },
};
