const prefix = AccountsEx.methodPrefix;
const actions = AccountsEx._actions;

Meteor.methods({
    [prefix + 'login'](options){
        let self = this;
        return Accounts._loginMethod(
            self,
            prefix + 'login',
            arguments,
            'accounts-ex',
            function () {
                return actions.login.invoke(options, self);
            }
        );
    },

    [prefix + 'resetPassword'](options){
        let self = this;
        return Accounts._loginMethod(
            self,
            prefix + 'resetPassword',
            arguments,
            'accounts-ex',
            function () {
                return actions.resetPassword.invoke(options, self);
            }
        );
    }
});