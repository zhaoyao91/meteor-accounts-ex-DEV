const emailDef = {type: String, regEx: SimpleSchema.RegEx.Email};
const phoneDef = {type: String, regEx: SimpleSchema.RegEx.Phone};
const projectDef = {type: String};
const passwordDef = {type: String, min: 1};
const codeDef = {type: String};

AccountsEx.setActionHooks({
    /**
     * send email verify code to console with default ttl and code options
     */
    sendEmailVerifyCode: {
        before: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                project: projectDef
            });
            return function ({email, project}) {
                schema.validate({email, project});

                // you should decide ttl and code options by project
                const ttl = 10 * 60 * 1000; // 10 minutes
                const codeOptions = {length: 6, alphabet: '0123456789'};

                return {email, project, ttl, codeOptions};
            }
        }()),

        after({email, project, ttl, code}) {
            // you should decide how to send email by project
            console.log('AccountsEx send email', {email, project, ttl, code});
        }
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
            return function ({email, code, password}) {
                schema.validate({email, code, password});

                // check email is not linked with any user
                let emailUser = AccountsEx.findUserByEmail(email);
                if (emailUser) {
                    throw new Meteor.Error('email-already-linked-with-user', 'email is already linked with some user');
                }

                // check verify code
                let result = AccountsEx.VerifyCodes.verify({type: 'email', key: email, code});
                if (!result) {
                    throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
                }

                return {email, password, verified: true};
            }
        }())
    },

    loginWithEmail: {
        /**
         * 1. email is linked with some user
         * 2. email is verified
         * 3. verify code is valid or password is matched
         * 4. if login with verify code, then email will be set verified
         */
        before: (function () {
            const schema = new SimpleSchema({
                email: emailDef,
                code: _.extend({optional: true}, codeDef),
                password: _.extend({optional: true}, passwordDef)
            });
            return function ({email, code, password}) {
                schema.validate({email, code, password});

                // find user
                let user = AccountsEx.findUserByEmail(email);
                if (!user) {
                    throw new Meteor.Error('no-user', 'email is not linked with any user');
                }
                let emailIsVerified = _.find(user.emails, {address: email}).verified;

                if (password) {
                    // login with password

                    // email must be verified
                    if (!emailIsVerified) {
                        throw new Meteor.Error('email-not-verified', 'linked email is not verified');
                    }

                    // check password
                    AccountsEx.checkPassword(user, password);
                }
                else if (code) {
                    // login with verify code

                    // check verify code
                    let result = AccountsEx.VerifyCodes.verify({type: 'email', key: email, code});
                    if (!result) {
                        throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
                    }

                    // email will be set verified
                    if (!emailIsVerified) {
                        AccountsEx.addEmail(user._id, email, true);
                    }
                }
                else {
                    throw new Meteor.Error('failed-to-login', 'cannot login without password or code');
                }

                return {userId: user._id}
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
            return function ({email, code, newPassword}) {
                schema.validate({email, code, newPassword});

                // find user
                let user = AccountsEx.findUserByEmail(email);
                if (!user) {
                    throw new Meteor.Error('no-user', 'email is not linked with any user');
                }

                // check verify code
                let result = AccountsEx.VerifyCodes.verify({type: 'email', key: email, code});
                if (!result) {
                    throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
                }

                return {userId: user._id, newPassword};
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
            return function ({email, code, verifyPhone}) {
                schema.validate({email, code, verifyPhone});

                // check login
                let user = Meteor.user();
                if (!user) {
                    throw new Meteor.Error('not-login', 'user must login');
                }

                // check user is not linked with any email
                if (user.emails && user.emails.length > 0) {
                    throw new Meteor.Error('user-already-linked-with-email', 'user is already linked with some email');
                }

                // check email is not linked with any user
                let emailUser = AccountsEx.findUserByEmail(email);
                if (emailUser) {
                    throw new Meteor.Error('email-already-linked-with-user', 'email is already linked with some user');
                }

                // check verify code
                let verifyOk = AccountsEx.VerifyCodes.verify({type: 'email', key: email, code});
                if (!verifyOk) {
                    throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
                }

                // check if user is linked with phone
                if (user.phones && user.phones.length > 0) {
                    if (!verifyPhone) {
                        throw new Meteor.Error('no-phone-verification-data', 'you must verify linked phone');
                    }

                    // check if phones match
                    if (!_.find(user.phones, {number: verifyPhone.phone})) {
                        throw new Meteor.Error('wrong-phone', 'user is not linked with this phone');
                    }

                    // check phone verify code
                    verifyOk = AccountsEx.VerifyCodes.verify({
                        type: 'phone',
                        key: verifyPhone.phone,
                        code: verifyPhone.code
                    });
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
                    }
                }

                return {userId: user._id, email, verified: true};
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
            return function ({email, code, verifyPhone}) {
                schema.validate({email, code, verifyPhone});

                // find user
                let user = AccountsEx.findUserByEmail(email);
                if (!user) {
                    throw new Meteor.Error('no-user', 'email is not linked with any user');
                }

                // check user is linked with phone
                if (!user.phones || !(user.phones.length > 0)) {
                    throw new Meteor.Error(
                        'user-not-linked-with-phone',
                        'user must be linked with phone before unlink email');
                }

                // verify email
                if (code) {
                    let verifyOk = AccountsEx.VerifyCodes.verify({type: 'email', key: email, code});
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-email', 'email verify code is wrong or expired');
                    }
                }
                // verify phone
                else if (verifyPhone) {
                    // check if phones match
                    if (!_.find(user.phones, {number: verifyPhone.phone})) {
                        throw new Meteor.Error('wrong-phone', 'user is not linked with this phone');
                    }

                    // check verify code
                    let verifyOk = AccountsEx.VerifyCodes.verify({
                        type: 'phone',
                        key: verifyPhone.phone,
                        code: verifyPhone.code
                    });
                    if (!verifyOk) {
                        throw new Meteor.Error('failed-to-verify-phone', 'phone verify code is wrong or expired');
                    }
                }
                else {
                    throw new Meteor.Error(
                        'no-verification-data',
                        'you must specify email verify code or phone verification data'
                    );
                }

                return {userId: user._id, email};
            }
        }())
    }
});
