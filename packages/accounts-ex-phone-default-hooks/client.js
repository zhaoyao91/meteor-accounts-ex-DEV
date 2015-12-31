const emailDef = {type: String, regEx: SimpleSchema.RegEx.Email};
const phoneDef = {type: String, regEx: SimpleSchema.RegEx.Phone};
const projectDef = {type: String};
const passwordDef = {type: String};
const codeDef = {type: String};

AccountsEx.setActionHooks({
    sendPhoneVerifyCode: {
        before: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
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

    createUserWithPhone: {
        /**
         * 1 phone is not linked with any user
         * 2 phone verify code is valid
         */
        before: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
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

    loginWithPhone: {
        /**
         * 1 phone + password
         * 2 or phone + verify code
         * 3 phone must be verified
         */
        before: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
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

    resetPasswordWithPhone: {
        /**
         * 1 phone is linked with some user
         * 2 verify code is valid
         */
        before: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
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

    linkPhone: {
        /**
         * 1 user must login
         * 2 phone is not linked with any user
         * 3 user is not linked with any phone
         * 4 verify code is valid
         * 5 if user is linked with email, verify it
         */
        before: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
                code: codeDef,
                verifyEmail: {
                    type: new SimpleSchema(({
                        email: emailDef,
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

    unlinkPhone: {
        /**
         * 1 phone is linked with some user
         * 2 user is linked with phone (prevent null user after unlink phone)
         * 3 verify phone or verify email
         */
        before: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
                code: _.extend({optional: true}, codeDef),
                verifyEmail: {
                    type: new SimpleSchema(({
                        email: emailDef,
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
