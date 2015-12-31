const emailDef = {type: String, regEx: SimpleSchema.RegEx.Email};
const phoneDef = {type: String, regEx: SimpleSchema.RegEx.Phone};
const projectDef = {type: String};
const passwordDef = {type: String};
const codeDef = {type: String};

AccountsEx.setActionHooks({
    /**
     * send phone verify code to console with default ttl and code options
     */
    sendPhoneVerifyCode: {
        before: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
                project: projectDef
            });
            return function ({phone, project}) {
                schema.validate({phone, project});

                // you should decide ttl and code options by project
                const ttl = 10 * 60 * 1000; // 10 minutes
                const codeOptions = {length: 6, alphabet: '0123456789'};

                return {phone, project, ttl, codeOptions};
            }
        }()),

        after({phone, project, ttl, code}) {
            // you should decide how to send sms by project
            console.log('AccountsEx send sms', {phone, project, ttl, code});
        }
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
            return function ({phone, code, password}) {
                schema.validate({phone, code, password});

                // check phone is not linked with any user
                let phoneUser = AccountsEx.findUserByPhone(phone);
                if (phoneUser) {
                    throw new Meteor.Error('phone-already-linked-with-user', 'phone is already linked with some user');
                }

                // check verify code
                let result = AccountsEx.VerifyCodes.verify({type: 'phone', key: phone, code});
                if (!result) {
                    throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
                }

                return {phone, password, verified: true};
            }
        }())
    },

    loginWithPhone: {
        /**
         * 1. phone is linked with some user
         * 2. phone is verified
         * 3. verify code is valid or password is matched
         * 4. if login with verify code, then phone will be set verified
         */
        before: (function () {
            const schema = new SimpleSchema({
                phone: phoneDef,
                code: _.extend({optional: true}, codeDef),
                password: _.extend({optional: true}, passwordDef)
            });
            return function ({phone, code, password}) {
                schema.validate({phone, code, password});

                // find user
                let user = AccountsEx.findUserByPhone(phone);
                if (!user) {
                    throw new Meteor.Error('no-user', 'phone is not linked with any user');
                }
                let phoneIsVerified = _.find(user.phones, {number: phone}).verified;

                if (password) {
                    // login with password

                    // phone must be verified
                    if (!phoneIsVerified) {
                        throw new Meteor.Error('phone-not-verified', 'linked phone is not verified');
                    }

                    // check password
                    AccountsEx.checkPassword(user, password);
                }
                else if (code) {
                    // login with verify code

                    // check verify code
                    let result = AccountsEx.VerifyCodes.verify({type: 'phone', key: phone, code});
                    if (!result) {
                        throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
                    }

                    // phone will be set verified
                    if (!phoneIsVerified) {
                        AccountsEx.addPhone(user._id, phone, true);
                    }
                }
                else {
                    throw new Meteor.Error('failed-to-login', 'cannot login without password or code');
                }

                return {userId: user._id}
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
            return function ({phone, code, newPassword}) {
                schema.validate({phone, code, newPassword});

                // find user
                let user = AccountsEx.findUserByPhone(phone);
                if (!user) {
                    throw new Meteor.Error('no-user', 'phone is not linked with any user');
                }

                // check verify code
                let result = AccountsEx.VerifyCodes.verify({type: 'phone', key: phone, code});
                if (!result) {
                    throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
                }

                return {userId: user._id, newPassword};
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
            return function ({phone, code, verifyEmail}) {
                schema.validate({phone, code, verifyEmail});

                // check login
                let user = Meteor.user();
                if (!user) {
                    throw new Meteor.Error('not-login', 'user must login');
                }

                // check user is not linked with any phone
                if (user.phones && user.phones.length > 0) {
                    throw new Meteor.Error('user-already-linked-with-phone', 'user is already linked with some phone');
                }

                // check phone is not linked with any user
                let phoneUser = AccountsEx.findUserByPhone(phone);
                if (phoneUser) {
                    throw new Meteor.Error('phone-already-linked-with-user', 'phone is already linked with some user');
                }

                // check verify code
                let verifyOk = AccountsEx.VerifyCodes.verify({type: 'phone', key: phone, code});
                if (!verifyOk) {
                    throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
                }

                // check if user is linked with email
                if (user.emails && user.emails.length > 0) {
                    if (!verifyEmail) {
                        throw new Meteor.Error('no-email-verification-data', 'you must verify linked email');
                    }

                    // check if emails match
                    if (!_.find(user.emails, {address: verifyEmail.email})) {
                        throw new Meteor.Error('wrong-email', 'user is not linked with this email');
                    }

                    // check email verify code
                    verifyOk = AccountsEx.VerifyCodes.verify({
                        type: 'email',
                        key: verifyEmail.email,
                        code: verifyEmail.code
                    });
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
                    }
                }

                return {userId: user._id, phone, verified: true};
            }
        }())
    },

    unlinkPhone: {
        /**
         * 1 phone is linked with some user
         * 2 user is linked with email (prevent null user after unlink phone)
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
            return function ({phone, code, verifyEmail}) {
                schema.validate({phone, code, verifyEmail});

                // find user
                let user = AccountsEx.findUserByPhone(phone);
                if (!user) {
                    throw new Meteor.Error('no-user', 'phone is not linked with any user');
                }

                // check user is linked with email
                if (!user.emails || !(user.emails.length > 0)) {
                    throw new Meteor.Error(
                        'user-not-linked-with-email',
                        'user must be linked with email before unlink phone');
                }

                // verify phone
                if (code) {
                    let verifyOk = AccountsEx.VerifyCodes.verify({type: 'phone', key: phone, code});
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
                    }
                }
                // verify email
                else if (verifyEmail) {
                    // check if emails match
                    if (!_.find(user.emails, {address: verifyEmail.email})) {
                        throw new Meteor.Error('wrong-email', 'user is not linked with this email');
                    }

                    // check verify code
                    let verifyOk = AccountsEx.VerifyCodes.verify({
                        type: 'email',
                        key: verifyEmail.email,
                        code: verifyEmail.code
                    });
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
                    }
                }
                else {
                    throw new Meteor.Error(
                        'no-verification-data',
                        'you must specify phone verify code or email verification data'
                    );
                }

                return {userId: user._id, phone};
            }
        }())
    }
});
