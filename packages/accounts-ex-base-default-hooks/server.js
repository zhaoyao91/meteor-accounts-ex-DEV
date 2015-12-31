const emailDef = {type: String, regEx: SimpleSchema.RegEx.Email};
const phoneDef = {type: String, regEx: SimpleSchema.RegEx.Phone};
const passwordDef = {type: String};

AccountsEx.setActionHooks({
    login: {
        /**
         * login with password and linked email or linked phone
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

                // find linked user
                let user;
                if (email) {
                    if (!AccountsEx.findUserByEmail) {
                        throw new Meteor.Error(
                            'cannot-login-with-email',
                            'accounts-ex-email package is not added, so user cannot login with email');
                    }
                    user = AccountsEx.findUserByEmail(email);
                }
                else if (phone) {
                    if (!AccountsEx.findUserByPhone) {
                        throw new Meteor.Error(
                            'cannot-login-with-phone',
                            'accounts-ex-phone package is not added, so user cannot login with phone');
                    }
                    user = AccountsEx.findUserByPhone(phone);
                }
                else {
                    throw new Meteor.Error('no-email-or-phone', 'you must specify email or phone');
                }

                if (!user) {
                    throw new Meteor.Error('no-user', 'no such user');
                }

                // check password
                AccountsEx.checkPassword(user, password);

                return {userId: user._id};
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
