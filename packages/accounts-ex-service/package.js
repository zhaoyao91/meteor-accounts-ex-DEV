Package.describe({
    name: 'zhaoyao91:accounts-ex-service',
    version: '0.0.1',
    summary: '',
    git: '',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.1');
    api.use('ecmascript');
    api.use('accounts-base');
    api.use('stevezhu:lodash@4.0.0');
    api.use('aldeed:simple-schema@1.5.0', 'server');
    api.use('bozhao:link-accounts@1.2.5');
    api.use('zhaoyao91:accounts-ex-base@0.0.1');

    api.imply('zhaoyao91:accounts-ex-base@0.0.1');

    api.addFiles('server/AccountsEx.js', 'server');
    api.addFiles('server/methods.js', 'server');

    api.addFiles('client/AccountsEx.js', 'client');
});