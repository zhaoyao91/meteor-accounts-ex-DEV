# Accounts-Ex-Service-Default-Hooks

Default actions hooks for accounts-ex-service

## Hooks (policies)

### unlinkService.before({serviceName})
unlink some service

1. user must login
2. user is linked with the service
3. user is linked with phone or email (prevent null user)
