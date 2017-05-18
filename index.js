/* jshint node: true */
'use strict';

var BasePlugin = require('ember-cli-deploy-plugin');
var Rsync = require('rsync');
var Promise = require('rsvp').Promise;
var SilentError = require('silent-error');

module.exports = {
  name: 'ember-cli-deploy-rsync-assets',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        source: 'tmp/deploy-dist/.',
        excludeIndexHTML: true,
        dry: false
      },
      //requiredConfig: ['source', 'destination'],

      upload: function(/*context*/) {
        this.log('rsync assets from ' + this.readConfig('source') + '…');
        var rsync = this.command();
        return new Promise(function(resolve, reject) {
          rsync.execute(function(error, code, cmd) {
            this.log('cmd: ' + cmd);
            if (error) {
              this.log(error);
              reject(new SilentError(error));
            } else {
              resolve();
            }
          }.bind(this), function(data) {
            this.log(data);
          }.bind(this));
        }.bind(this));
      },

      command: function() {
        var rsync = Rsync.build({
          source:      this.readConfig('source'),
          destination: this.readConfig('destination'),
          exclude:     ['.git', '.DS_Store'],
          flags:       ['a', 'v', 'progress']
        });
        if (this.readConfig('excludeIndexHTML')) {
          rsync.exclude('index.html');
        }
        var flags = this.readConfig('flags');
        if (Array.isArray(flags) && flags.length > 0) {
          rsync.flags(flags);
        }
        if (this.readConfig('dry')) {
          rsync.dry();
        } else if (this.readConfig('ssh')) {
          var rsh = 'ssh';
          var privateKeyPath = this.readConfig('privateKeyPath');
          if (privateKeyPath) {
            rsh = 'ssh -i ' + privateKeyPath;
          }
          rsync.shell(rsh);
        }
        return rsync;
      }
    });

    return new DeployPlugin();
  }
};
