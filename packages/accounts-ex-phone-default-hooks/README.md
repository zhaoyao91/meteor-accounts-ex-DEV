# Accounts-Ex-Phone-Default-Hooks

Default actions hooks for accounts-ex-phone

## Hooks (policies)

### sendPhoneVerifyCode.before({phone, project})
send phone verify code with default ttl and code options.
usually you should override this to decide ttl and code options by project.

### sendPhoneVerifyCode.after({phone, project, ttl, code})
send phone verify code to console.
usually you should override this to decide how to send the code by project.

### createUserWithPhone.before({phone, code, password})
create user with phone

1. phone is not linked with any user
2. phone verify code is valid

### loginWithPhone.before({phone, [code], [password]})
login with phone and (verify code or password)

1. phone is linked with some user
2. phone is verified
3. verify code is valid or password is matched
4. if login with verify code, then phone will be set verified

### resetPasswordWithPhone.before({phone, code, newPassword})
reset password with phone

1. phone is linked with some user
2. verify code is valid

### linkPhone.before({phone, code, [verifyEmail]})
link phone

1. user must login
2. phone is not linked with any user
3. user is not linked with any phone
4. verify code is valid
5. if user is linked with email, verify it

### unlinkPhone.before({phone, code, [verifyEmail]})
unlink phone

1. phone is linked with some user
2. user is linked with email (prevent null user after unlink phone)
3. verify phone or verify email
