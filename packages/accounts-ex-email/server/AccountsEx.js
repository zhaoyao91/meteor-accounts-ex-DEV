const emailDef = {
    type: String,
    regEx: SimpleSchema.RegEx.Email
};
const projectDef = {type: String};
const ttlDef = {type: Number};
const codeOptionsDef = {
    type: new SimpleSchema({
        length: {type: Number, optional: true},
        alphabet: {type: String, optional: true}
    })
};
const codeDef = {type: String};
const verifiedDef = {type: Boolean};
const passwordDef = {type: String};
const userIdDef = {type: String};

_.extend(AccountsEx._actions, {
    sendEmailVerifyCode: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                project: projectDef,
                ttl: ttlDef,
                codeOptions: _.extend({optional: true}, codeOptionsDef)
            });
            return function ({email, project, ttl, codeOptions}) {
                schema.validate({email, project, ttl, codeOptions});

                // create verify code
                let code = AccountsEx.VerifyCodes.create({
                    type: 'email',
                    key: email,
                    ttl: ttl,
                    options: codeOptions
                });

                // send verifyCode
                // how to send verify code? we leave it to after hook
                return {email, project, ttl, code};
            }
        }())
    }),

    createUserWithEmail: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                password: _.extend({optional: true}, passwordDef),
                verified: verifiedDef
            });
            return function ({email, password, verified=false}) {
                schema.validate({email, password, verified});

                let userId = AccountsEx.createUser(password);
                if (!userId) {
                    throw new Error('failed to insert user doc');
                }
                AccountsEx.addEmail(userId, email, verified);

                return {userId};
            }
        }())
    }),

    loginWithEmail: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                userId: userIdDef
            });
            return function ({userId}) {
                schema.validate({userId});
                return {userId}
            }
        }())
    }),

    resetPasswordWithEmail: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                userId: userIdDef,
                newPassword: passwordDef,
                options: {
                    type: Object,
                    blackbox: true,
                    optional: true
                }
            });
            return function ({userId, newPassword, options}) {
                schema.validate({userId, newPassword, options});

                let isCurrentUser = Meteor.user() && Meteor.userId() === userId;

                AccountsEx.setPassword(userId, newPassword, options);

                if (isCurrentUser) {
                    // reset token on connection
                    // important!, refer to Accounts.resetPassword
                    Accounts._setLoginToken(userId, this.connection, null);
                }

                return {userId};
            }
        }())
    }),

    linkEmail: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                userId: userIdDef,
                email: emailDef,
                verified: verifiedDef
            });
            return function ({userId, email, verified=false}) {
                schema.validate({userId, email, verified});
                AccountsEx.addEmail(userId, email, verified);
            }
        }())
    }),

    unlinkEmail: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                userId: userIdDef,
                email: emailDef
            });
            return function ({userId, email}) {
                schema.validate({userId, email});
                AccountsEx.removeEmail(userId, email);
            }
        }())
    })
});

_.extend(AccountsEx, {

    // helpers

    /**
     * find user linked with this email
     * @param email
     * @return user
     */
    findUserByEmail(email) {
        return Meteor.users.findOne({'emails.address': email});
    },

    /**
     * add or update email to user
     * @param selector
     * @param email
     * @param [verified] - default false
     */
    addEmail(selector, email, verified = false) {
        let user = Meteor.users.findOne(selector);
        if (!user) {
            throw new Meteor.Error('no-user', 'no such user');
        }

        // check if the user already linked with this email
        // if so, only update the verified flag
        let emailData = _.find(user.emails, {address: email});
        if (emailData) {
            if (emailData.verified !== verified) {
                // only update verified
                Meteor.users.update({
                    _id: user._id,
                    'emails.address': email
                }, {
                    $set: {
                        'emails.$.verified': verified
                    }
                });
            }
        }
        else {
            // add this email
            Meteor.users.update(user._id, {
                $push: {emails: {address: email, verified: verified}}
            });
        }
    },

    /**
     * remove email from a user
     * @param selector
     * @param email
     */
    removeEmail(selector, email) {
        Meteor.users.update(selector, {$pull: {emails: {address: email}}});
    }
});