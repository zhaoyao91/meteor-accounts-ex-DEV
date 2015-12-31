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
            return function ({serviceName}) {
                schema.validate({serviceName});

                // check user login
                let user = Meteor.user();
                if (!user) {
                    throw new Meteor.Error('not-login', 'you must login');
                }

                // check user is linked with the service
                if (!user.services[serviceName]) {
                    throw new Meteor.Error('no-service', `user is not linked with ${serviceName}`);
                }

                // check user is linked with phone or email
                let linkedWithEmail = user.emails && user.emails.length > 0;
                let linkedWithPhone = user.phones && user.phones.length > 0;
                if (!linkedWithEmail && !linkedWithPhone) {
                    throw new Meteor.Error(
                        'not-linked-with-phone-or-email',
                        `user must be linked with phone or email before unlink ${serviceName}`);
                }

                return {userId: user._id, serviceName};
            }
        }())
    }
});
