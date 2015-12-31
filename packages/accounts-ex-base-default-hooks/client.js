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
            return function ({email, phone, password}, callback) {
                try {
                    schema.validate({email, phone, password});
                }
                catch (err) {
                    return callback(err);
                }
                return callback(null, {email, phone, password});
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
            return function ({oldPassword, newPassword}, callback) {
                try {
                    schema.validate({oldPassword, newPassword});
                }
                catch (err) {
                    return callback(err);
                }
                return callback(null, {oldPassword, newPassword});
            }
        }())
    }
});
