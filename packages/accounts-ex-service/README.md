# Accounts-Ex-Service

Extend Accounts-Ex system to support **external services** as account linkings.
To support a specific service, you need to add the corresponding accounts-xxx package.
(todo link to Accounts-Ex)

## Actions

- loginWithService(serviceName, [options])
- linkService(serviceName, [options])
- (hookable) unlinkService({userId, serviceName})

## Thanks to

- bozhao:link-accounts todo add link