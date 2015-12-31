# Accounts-Ex-Base-Default-Hooks

Default actions hooks for accounts-ex-base

## Hooks (policies)

### login.before({[email], [phone], password})
enable user login with password and (linked email or linked phone)

1. specify email or phone
2. password is matched

### resetPassword.before({oldPassword, newPassword})
reset password by checking oldPassword

1. user must login
2. old password is matched