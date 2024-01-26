const { composePlugins, withNx } = require('@nx/webpack')
const path = require('path')
const { merge } = require('webpack-merge')

module.exports = composePlugins(withNx({target: 'node',}), (config, ctx) => {
    return merge(config, {
      output: {
        devtoolModuleFilenameTemplate: (info) => {
          const rel = path.relative(ctx.context.cwd, info.absoluteResourcePath)
          return `webpack:///data/project/${rel}`
        },
      },
      devtool: 'source-map',
    },
    {
        ignoreWarnings: [/Failed to parse source map/]
    })
  },
)
