Package.describe({
    name: 'zhaoyao91:accounts-ex-base',
    version: '0.0.1',
    summary: '',
    git: '',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.1');
    api.use('ecmascript');
    api.use('mongo');
    api.use('accounts-base');
    api.use('sha');
    api.use('npm-bcrypt@=0.7.8_2');
    api.use('stevezhu:lodash@3.10.1');
    api.use('aldeed:simple-schema@1.5.0', 'server');

    // lib
    api.addFiles('lib/VerifyCodes_server.js', 'server');
    api.addFiles('lib/HookableAction_server.js', 'server');
    api.addFiles('lib/HookableAction_client.js', 'client');

    // server
    api.addFiles('server/AccountsEx.js', 'server');
    api.addFiles('server/methods.js', 'server');

    // client
    api.addFiles('client/AccountsEx.js', 'client');

    // export
    api.export('AccountsEx');
});

Npm.depends({
    nid: '0.3.2'
});