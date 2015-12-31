_.extend(AccountsEx._actions, {
    unlinkService: new AccountsEx._HookableAction({
        action: (function () {
            const schema = new SimpleSchema({
                userId: {type: String},
                serviceName: {type: String}
            });
            return function ({userId, serviceName}) {
                schema.validate({userId, serviceName});
                Accounts.unlinkService(userId, serviceName);
            }
        }())
    })
});