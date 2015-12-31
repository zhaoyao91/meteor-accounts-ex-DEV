const emailDef = {type: String, regEx: SimpleSchema.RegEx.Email};
const phoneDef = {type: String, regEx: SimpleSchema.RegEx.Phone};
const projectDef = {type: String};
const passwordDef = {type: String};
const codeDef = {type: String};

AccountsEx.setActionHooks({
    sendEmailVerifyCode: {
        before: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                project: projectDef
            });
            return function (options, callback) {
                try {
                    schema.validate(options);
                }
                catch (err) {
                    return callback(err);
                }
                return callback(null, options);
            }
        }())
    },

    createUserWithEmail: {
        /**
         * 1 email is not linked with any user
         * 2 email verify code is valid
         */
        before: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                code: codeDef,
                password: passwordDef
            });
            return function (options, callback) {
                try {
                    schema.validate(options);
                }
                catch (err) {
                    return callback(err);
                }
                return callback(null, options);
            }
        }())
    },

    loginWithEmail: {
        /**
         * 1 email + password
         * 2 or email + verify code
         * 3 email must be verified
         */
        before: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                code: _.extend({optional: true}, codeDef),
                password: _.extend({optional: true}, passwordDef)
            });
            return function (options, callback) {
                try {
                    schema.validate(options);
                    if (!options.password && !options.code) {
                        throw new Meteor.Error('failed-to-login', 'cannot login without password or code')
                    }
                }
                catch (err) {
                    return callback(err);
                }
                return callback(null, options);
            }
        }())
    },

    resetPasswordWithEmail: {
        /**
         * 1 email is linked with some user
         * 2 verify code is valid
         */
        before: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                code: codeDef,
                newPassword: passwordDef
            });
            return function (options, callback) {
                try {
                    schema.validate(options);
                }
                catch (err) {
                    return callback(err);
                }
                return callback(null, options);
            }
        }())
    },

    linkEmail: {
        /**
         * 1 user must login
         * 2 email is not linked with any user
         * 3 user is not linked with any email
         * 4 verify code is valid
         * 5 if user is linked with phone, verify it
         */
        before: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                code: codeDef,
                verifyPhone: {
                    type: new SimpleSchema(({
                        phone: phoneDef,
                        code: codeDef
                    })),
                    optional: true
                }
            });
            return function (options, callback) {
                try {
                    schema.validate(options);
                    if (!Meteor.user()) {
                        throw new Meteor.Error('not-login', 'you must login');
                    }
                }
                catch (err) {
                    return callback(err);
                }
                return callback(null, options);
            }
        }())
    },

    unlinkEmail: {
        /**
         * 1 email is linked with some user
         * 2 user is linked with phone (prevent null user after unlink email)
         * 3 verify email or verify phone
         */
        before: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                code: _.extend({optional: true}, codeDef),
                verifyPhone: {
                    type: new SimpleSchema(({
                        phone: phoneDef,
                        code: codeDef
                    })),
                    optional: true
                }
            });
            return function (options, callback) {
                try {
                    schema.validate(options);
                }
                catch (err) {
                    return callback(err);
                }
                return callback(null, options);
            }
        }())
    }
});
