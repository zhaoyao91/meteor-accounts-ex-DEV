AccountsEx.setActionHooks({
    unlinkService: {
        /**
         * user must login
         * user is linked with the service
         * user is linked with phone or email (prevent null user)
         */
        before: (function () {
            const schema = new SimpleSchema({
                serviceName: {type: String}
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
    }
});
