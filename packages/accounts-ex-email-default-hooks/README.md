# Accounts-Ex-Email-Default-Hooks

Default actions hooks for accounts-ex-email

## Hooks (policies)

### sendEmailVerifyCode.before({email, project})
send email verify code with default ttl and code options.
usually you should override this to decide ttl and code options by project.

### sendEmailVerifyCode.after({email, project, ttl, code})
send email verify code to console.
usually you should override this to decide how to send the code by project.

### createUserWithEmail.before({email, code, password})
create user with email

1. email is not linked with any user
2. email verify code is valid

### loginWithEmail.before({email, [code], [password]})
login with email and (verify code or password)

1. email is linked with some user
2. email is verified
3. verify code is valid or password is matched
4. if login with verify code, then email will be set verified

### resetPasswordWithEmail.before({email, code, newPassword})
reset password with email

1. email is linked with some user
2. verify code is valid

### linkEmail.before({email, code, [verifyPhone]})
link email

1. user must login
2. email is not linked with any user
3. user is not linked with any email
4. verify code is valid
5. if user is linked with phone, verify it

### unlinkEmail.before({email, code, [verifyPhone]})
unlink email

1. email is linked with some user
2. user is linked with phone (prevent null user after unlink email)
3. verify email or verify phone
