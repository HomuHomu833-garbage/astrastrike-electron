module.exports = {
  packagerConfig: {
    asar: true,
    icon: './src/icons/icon',
    name: 'AstraStrike',
    ignore: [
      // Ship only electron-squirrel-startup (+ its nested deps); drop devDeps.
      // Anchored so it strips top-level node_modules only, not the nested
      // node_modules/electron-squirrel-startup/node_modules/{debug,ms}.
      /^\/node_modules\/(?!electron-squirrel-startup(?:\/|$))/,
      /\.yarn/,
      /\.idea/,
      /\.git/,
      /out/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [],
}
