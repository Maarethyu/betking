const webpack = require('webpack')
const path = require('path')
const express = require('express')
const csrfProtection = require('csurf')({cookie: true});

const config = require('../config')
const webpackConfig = require('./webpack.dev.conf');

module.exports = (app) => {
  var compiler = webpack(webpackConfig)

  var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
    stats: {
      colors: true,
      chunks: false
    }
  })

  var hotMiddleware = require('webpack-hot-middleware')(compiler)
  // force page reload when html-webpack-plugin template changes
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
      hotMiddleware.publish({ action: 'reload' })
      cb()
    })
  })

  // handle fallback for HTML5 history API
  app.use(require('connect-history-api-fallback')())

  // serve webpack bundle output
  app.use(devMiddleware)

  // enable hot-reload and state-preserving
  // compilation error display
  app.use(hotMiddleware)

  // serve pure static assets
  var staticPath = path.posix.join(config.dev.assetsPublicPath)
  app.use(staticPath, express.static(path.join(__dirname, '..', 'static')))

  app.get('*', csrfProtection, function (req, res, next) {
    var filename = path.join(compiler.outputPath,'index.html');

    /* Wait till webpack has finished bundling */
    devMiddleware.waitUntilValid(() => {
      compiler.outputFileSystem.readFile(filename, function(err, result) {
        if (err) {
          return next(err);
        }
        res.set('content-type','text/html');

        // Add csrf token
        const str = result.toString().replace(
          '</body>',
          `<input type="hidden" id="csrfToken" value="${req.csrfToken()}"/></body>`
        );

        res.send(str);
        res.end();
      });
    });
  });
};
