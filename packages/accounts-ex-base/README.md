# Accounts-Ex-Base

Accounts-Ex is a series of packages that extend Meteor Accounts system to support different kinds of account linking in
a standard, uniformed and highly customizable way.

## Actions

- (hookable) login({userId}): {userId}
- (hookable) resetPassword({userId, newPassword, {logout=true}})
- logout()

## Helpers

- (client) hashPassword(password): hashedPassword

- (server) createUser([password]): userId
- (server) setPassword(userId, newPassword, {logout=true})
- (server) checkPassword(user, password)
- (server) VerifyCodes - see concept todo add links

## Concepts

### Actions

An action is a client function attached to `AccountsEx`.

An **hookable** action is an action with configurable hooks on both client and server.
    
                                        before  1
                        client action < action  2
                                        after   6
    hookable action <                   
                                        before  3
                        server action < action  4
                                        after   5

Data flow in a waterfall way in the order as shown above. By saying waterfall way, I mean the results of previous function will be
the params of next function.

By default (if you doesn't add the xxx-default-hooks package), only the actions part (2, 4) are defined, and all the
before and after hooks can be set or override.

To learn to how to config the hooks, see xxx-default-hooks. todo add links

### Helpers

Functions attached to `AccountsEx` to help users config hooks or build logic.

### Verify Codes

This package has a built-in verify codes system. The purpose of verify code is to verify that the user does hold the 
account(email, phone, etc...).

Use `AccountsEx.VerifyCodes` to get this system.

#### Apis

- create({type, key, ttl, options}): String - ttl is in milliseconds, options can contain length(number), alphabet(string)
- remove({type, key, code})
- test({type, key, code}): Boolean
- verify({type, key, code}): Boolean - if ok, remove the code