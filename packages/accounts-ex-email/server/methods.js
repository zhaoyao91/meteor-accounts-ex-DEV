const prefix = AccountsEx.methodPrefix;
const actions = AccountsEx._actions;

Meteor.methods({
    [prefix + 'sendEmailVerifyCode'](options){
        return actions.sendEmailVerifyCode.invoke(options, this);
    },

    [prefix + 'createUserWithEmail'](options){
        let self = this;
        return Accounts._loginMethod(
            self,
            prefix + 'createUserWithEmail',
            arguments,
            'accounts-ex',
            function () {
                return actions.createUserWithEmail.invoke(options, self);
            }
        );
    },

    [prefix + 'loginWithEmail'](options){
        let self = this;
        return Accounts._loginMethod(
            self,
            prefix + 'loginWithEmail',
            arguments,
            'accounts-ex',
            function () {
                return actions.loginWithEmail.invoke(options, self);
            }
        );
    },

    [prefix + 'resetPasswordWithEmail'](options){
        let self = this;
        return Accounts._loginMethod(
            self,
            prefix + 'resetPasswordWithEmail',
            arguments,
            'accounts-ex',
            function () {
                return actions.resetPasswordWithEmail.invoke(options, self);
            }
        );
    },

    [prefix + 'linkEmail'](options){
        return actions.linkEmail.invoke(options, this);
    },

    [prefix + 'unlinkEmail'](options){
        return actions.unlinkEmail.invoke(options, this);
    }
});