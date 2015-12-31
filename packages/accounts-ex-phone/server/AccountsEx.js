const phoneDef = {
    type: String,
    regEx: SimpleSchema.RegEx.Phone
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
    sendPhoneVerifyCode: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
                project: projectDef,
                ttl: ttlDef,
                codeOptions: _.extend({optional: true}, codeOptionsDef)
            });
            return function ({phone, project, ttl, codeOptions}) {
                schema.validate({phone, project, ttl, codeOptions});

                // create verify code
                let code = AccountsEx.VerifyCodes.create({
                    type: 'phone',
                    key: phone,
                    ttl: ttl,
                    options: codeOptions
                });

                // send verifyCode
                // how to send verify code? we leave it to after hook
                return {phone, project, ttl, code};
            }
        }())
    }),

    createUserWithPhone: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
                password: _.extend({optional: true}, passwordDef),
                verified: verifiedDef
            });
            return function ({phone, password, verified=false}) {
                schema.validate({phone, password, verified});

                let userId = AccountsEx.createUser(password);
                if (!userId) {
                    throw new Error('failed to insert user doc');
                }
                AccountsEx.addPhone(userId, phone, verified);

                return {userId};
            }
        }())
    }),

    loginWithPhone: new AccountsEx._HookableAction({
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

    resetPasswordWithPhone: new AccountsEx._HookableAction({
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

    linkPhone: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                userId: userIdDef,
                phone: phoneDef,
                verified: verifiedDef
            });
            return function ({userId, phone, verified=false}) {
                schema.validate({userId, phone, verified});
                AccountsEx.addPhone(userId, phone, verified);
            }
        }())
    }),

    unlinkPhone: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                userId: userIdDef,
                phone: phoneDef
            });
            return function ({userId, phone}) {
                schema.validate({userId, phone});
                AccountsEx.removePhone(userId, phone);
            }
        }())
    })
});

_.extend(AccountsEx, {

    // helpers

    /**
     * find user linked with this phone
     * @param phone
     * @return user
     */
    findUserByPhone(phone) {
        return Meteor.users.findOne({'phones.number': phone});
    },

    /**
     * add or update phone to user
     * @param selector
     * @param phone
     * @param [verified] - default false
     */
    addPhone(selector, phone, verified = false) {
        let user = Meteor.users.findOne(selector);
        if (!user) {
            throw new Meteor.Error('no-user', 'no such user');
        }

        // check if the user already linked with this phone
        // if so, only update the verified flag
        let phoneData = _.find(user.phones, {number: phone});
        if (phoneData) {
            if (phoneData.verified !== verified) {
                // only update verified
                Meteor.users.update({
                    _id: user._id,
                    'phones.number': phone
                }, {
                    $set: {
                        'phones.$.verified': verified
                    }
                });
            }
        }
        else {
            // add this phone
            Meteor.users.update(user._id, {
                $push: {phones: {number: phone, verified: verified}}
            });
        }
    },

    /**
     * remove phone from a user
     * @param selector
     * @param phone
     */
    removePhone(selector, phone) {
        Meteor.users.update(selector, {$pull: {phones: {number: phone}}});
    }
});