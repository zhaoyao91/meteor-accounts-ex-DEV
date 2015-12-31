# Accounts-Ex-Phone

Extend Accounts-Ex system to support **phone** as account linking.
(todo link to Accounts-Ex)

## Actions

- (hookable) sendPhoneVerifyCode({phone, project, ttl, codeOptions}): {phone, project, ttl, code} - you need set the
after hook to actually send the sms.
- (hookable) createUserWithPhone({phone, [password], verified=false}): {userId}
- (hookable) loginWithPhone({userId}): {userId}
- (hookable) resetPasswordWithPhone({userId, newPassword, [{logout}]}): {userId} - options see AccountsEx.setPassword
- (hookable) linkPhone({userId, phone, verified=false})
- (hookable) unlinkPhone(hookable) mail({userId, phone})

## Helpers

- server findUserByPhone(phone): user
- server addPhone(selector, phone, verified=false)
- server removePhone(selector, phone)