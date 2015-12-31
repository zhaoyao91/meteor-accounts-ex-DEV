const prefix = AccountsEx.methodPrefix;
const actions = AccountsEx._actions;

Meteor.methods({
    [prefix + 'unlinkService'](options){
        return actions.unlinkService.invoke(options, this);
    }
});