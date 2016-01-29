Package.describe({
  name: 'zhaoyao91:accounts-ex-phone-default-hooks',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('stevezhu:lodash@4.0.0');
  api.use('aldeed:simple-schema@1.5.0');
  api.use('zhaoyao91:accounts-ex-phone@0.0.1');

  api.addFiles('server.js', 'server');
  api.addFiles('client.js', 'client');
});