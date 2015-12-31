# Accounts-Ex-Email

Extend Accounts-Ex system to support **email** as account linking.
(todo link to Accounts-Ex)

## Actions

- (hookable) sendEmailVerifyCode({email, project, ttl, codeOptions}): {email, project, ttl, code} - you need set the
after hook to actually send the email.
- (hookable) createUserWithEmail({email, [password], verified=false}): {userId}
- (hookable) loginWithEmail({userId}): {userId}
- (hookable) resetPasswordWithEmail({userId, newPassword, [{logout}]}): {userId} - options see AccountsEx.setPassword
- (hookable) linkEmail({userId, email, verified=false})
- (hookable) unlinkEmail(hookable) mail({userId, email})

## Helpers

- server findUserByEmail(email): user
- server addEmail(selector, email, verified=false)
- server removeEmail(selector, email)