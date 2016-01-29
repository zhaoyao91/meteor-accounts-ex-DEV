const emailDef = {type: String, regEx: SimpleSchema.RegEx.Email};
const phoneDef = {type: String, regEx: SimpleSchema.RegEx.Phone};
const passwordDef = {type: String, min: 1};

AccountsEx.setActionHooks({
    login: {
        /**
         * login with password and linked email or linked phone
         * 1. email or phone is linked with some user
         * 2. email or phone is verified
         * 3. password is matched
         *
         * @param [email]
         * @param [phone]
         * @param password
         * @return {userId}
         */
        before: (function () {
            const schema = new SimpleSchema({
                email: _.extend({optional: true}, emailDef),
                phone: _.extend({optional: true}, phoneDef),
                password: passwordDef
            });
            return function ({email, phone, password}) {
                schema.validate({email, phone, password});

                if (email) {
                    let user = AccountsEx.findUserByEmail(email);
                    if (!user) {
                        throw new Meteor.Error('no-user', 'email is not linked with any user');
                    }
                    let emailIsVerified = _.find(user.emails, {address: email}).verified;
                    if (!emailIsVerified) {
                        throw new Meteor.Error('email-not-verified', 'linked email is not verified');
                    }
                    AccountsEx.checkPassword(user, password);
                    return {userId: user._id};
                }
                else if (phone) {
                    let user = AccountsEx.findUserByPhone(phone);
                    if (!user) {
                        throw new Meteor.Error('no-user', 'phone is not linked with any user');
                    }
                    let phoneIsVerified = _.find(user.phones, {number: phone}).verified;
                    if (!phoneIsVerified) {
                        throw new Meteor.Error('phone-not-verified', 'linked phone is not verified');
                    }
                    AccountsEx.checkPassword(user, password);
                    return {userId: user._id};
                }
                else {
                    throw new Meteor.Error('no-email-or-phone', 'you must specify email or phone');
                }
            }
        }())
    },

    resetPassword: {
        /**
         * 1 user must login
         * 2 old password is matched
         */
        before: (function () {
            const schema = new SimpleSchema({
                oldPassword: passwordDef,
                newPassword: passwordDef
            });
            return function ({oldPassword, newPassword}) {
                schema.validate({oldPassword, newPassword});

                // check login
                let user = Meteor.user();
                if (!user) {
                    throw new Meteor.Error('not-login', 'you must login');
                }

                // check password
                AccountsEx.checkPassword(user, oldPassword);

                return {
                    userId: user._id,
                    newPassword: newPassword
                }
            }
        }())
    }
});
