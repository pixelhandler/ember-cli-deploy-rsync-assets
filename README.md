# ember-cli-deploy-rsync-assets

A plugin for [ember-cli-deploy], that provides a configurable `rsync` command
which uses the `upload` pipeline hook to sync assets to a destination
that you configure.

It would be a good idea to review the [writing-a-plugin] and [pipeline-hooks]
pages to learn more about the `upload` hook.

The [node-rsync] module is used to execute the rsync command.

See the `index.js` file in this repo; the main script that provides a function
for the `createDeployPlugin` method of this ember-cli-deploy addon.

[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-s3.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)

## Installation

Requires `ember-cli-deploy` addon to be installed first

    ember install ember-cli-deploy-rsync-assets

For production deployment the `build` plugin is required

    ember install ember-cli-deploy-build

## Deploy config

Setup your configuration in config/deploy.js (generated when installing
ember-cli-deploy)

|option|type|description|
|:---|:---|:---|
|destination|String|The destination include, `user@IP` if needed|
|source|String|The source directory|
|ssh|Boolean|Use SSH when syncing|
|privateKeyPath|String|Path to your private key, may need with `ssh` option|
|excludeIndexHTML|Boolean|Exclude the `index.html` file, default is `true`|
|flags|Array|List of rsync flags to add, e.g. `['z']` to add compression|
|dry|Boolean|Option for dry run, does not connect when using ssh|

The `destination` option can be a local path or a remote one. When using the
`ssh` option be sure to include the user/domain, e.g.
`username@remote_host:/path_to_public`. Also, if your config uses `ssh: true`
you may need to also set the option for `privateKeyPath` to the path to your
ssh key (`/Users/<username>/.ssh/id_rsa`).

Below is an example `config/deploy.js` file setup to sync all the assets; and
also includes the the option to sync the `index.html` file.

Most likely the `ember-cli-deploy-rsync-assets` plugin will be used together
with other deploy plugins, e.g. self-hosting your assets instead of
using an S3 bucket.

*See the options assigned to `ENV['rsync-assets']` in the example config below…*

```js
/*jshint node:true*/
/* global module,process */
var VALID_DEPLOY_TARGETS = ['development-postbuild', 'production'];
module.exports = function(deployTarget) {
  if (VALID_DEPLOY_TARGETS.indexOf(deployTarget) === -1) {
    throw new Error('Invalid deployTarget ' + deployTarget);
  }
  var ENV = {};
  if (deployTarget === 'development-postbuild') {
    ENV.plugins = ['rsync-assets'];
    ENV.build = { environment: 'development' };
    ENV['rsync-assets'] = {
      destination: process.env['PUBLIC_DIR'],
      source: 'dist/.',
      excludeIndexHTML: false, // default is `true` to exclude index.html
      ssh: false,
      dry: false
    }
  } else if (deployTarget === 'production') {
    ENV.plugins = 'build rsync-assets'.split(' ');
    ENV.build = { environment: 'production' };
    ENV['rsync-assets'] = {
      destination: process.env['PUBLIC_DIR'],
      source: 'tmp/deploy-dist/.',
      excludeIndexHTML: false, // default is `true` to exclude index.html
      flags: ['z'], // compress, gzip
      ssh: true,
      privateKeyPath: process.env['PRIVATE_KEY_PATH']
    }
  }
  return ENV;
};
```

The example above uses a `deployTarget` of `development-postbuild` which runs
after the build. To setup the hook in your `ember-cli-build.js` file add the
`emberCLIDeploy` option, an example is below:

```js
/*jshint node:true*/
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    emberCLIDeploy: {
      runOnPostBuild: (env === 'development') ? 'development-postbuild' : false,
      configFile: 'config/deploy.js'
    }
  });
  return app.toTree();
};
```

When using as a replacement for S3 in the lightning-pack you can add the options
for `ENV['rsync-assets']` to your `config/deploy.js` file and also list the `plugins` to
run during deployment.

```js
  if (deployTarget === 'development-postbuild') {
    ENV.plugins = ['redis', 'rsync-assets'];
    // ... redis, rsync-assets settings
  } else if (deployTarget === 'production') {
    ENV.plugins = 'build display-revisions gzip redis manifest revision-data rsync-assets'.split(' ')
    //... redis, ssh-tunnel, rsync-assets settings…
  }
```

## Links

- [ember-cli-deploy]
- [writing-a-plugin]
- [node-rsync]
- [rsync_options]
- [sinatra-redis-server]

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).

[ember-cli-deploy]: https://github.com/ember-cli-deploy/ember-cli-deploy
[ember-cli-deploy-lightning-pack]: https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack
[writing-a-plugin]: http://ember-cli-deploy.github.io/ember-cli-deploy/docs/v0.6.x/writing-a-plugin/
[pipeline-hooks]: http://ember-cli-deploy.github.io/ember-cli-deploy/docs/v0.6.x/pipeline-hooks/
[node-rsync]: https://github.com/mattijs/node-rsync
[rsync_options]: http://ss64.com/bash/rsync_options.html
[sinatra-redis-server]: https://github.com/pixelhandler/sinatra-redis-server
