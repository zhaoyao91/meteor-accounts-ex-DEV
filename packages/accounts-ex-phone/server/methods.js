const prefix = AccountsEx.methodPrefix;
const actions = AccountsEx._actions;

Meteor.methods({
    [prefix + 'sendPhoneVerifyCode'](options){
        return actions.sendPhoneVerifyCode.invoke(options, this);
    },

    [prefix + 'createUserWithPhone'](options){
        let self = this;
        return Accounts._loginMethod(
            self,
            prefix + 'createUserWithPhone',
            arguments,
            'accounts-ex',
            function () {
                return actions.createUserWithPhone.invoke(options, self);
            }
        );
    },

    [prefix + 'loginWithPhone'](options){
        let self = this;
        return Accounts._loginMethod(
            self,
            prefix + 'loginWithPhone',
            arguments,
            'accounts-ex',
            function () {
                return actions.loginWithPhone.invoke(options, self);
            }
        );
    },

    [prefix + 'resetPasswordWithPhone'](options){
        let self = this;
        return Accounts._loginMethod(
            self,
            prefix + 'resetPasswordWithPhone',
            arguments,
            'accounts-ex',
            function () {
                return actions.resetPasswordWithPhone.invoke(options, self);
            }
        );
    },

    [prefix + 'linkPhone'](options){
        return actions.linkPhone.invoke(options, this);
    },

    [prefix + 'unlinkPhone'](options){
        return actions.unlinkPhone.invoke(options, this);
    }
});