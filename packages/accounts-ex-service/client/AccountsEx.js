const prefix = AccountsEx.methodPrefix;
const actions = {
    unlinkService: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Meteor.call(prefix + 'unlinkService', options, callback);
        }
    })
};

_.extend(AccountsEx._actions, actions);

_.extend(AccountsEx, {

    /**
     * login with some service account
     * is no user is linked with this service account, create one
     * @param serviceName
     * @param [options]
     * @param [callback]
     */
    loginWithService(serviceName, options, callback){
        // in case there is no options
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        callback = ensureCallback(callback);

        let loginWith = Meteor[`loginWith${_.capitalize(serviceName)}`];
        if (!loginWith) {
            return callback(new Meteor.Error('no-service', `you may forget to install accounts-${serviceName} package.`));
        }
        loginWith(options, callback);
    },

    linkService(serviceName, options, callback) {
        // in case there is no options
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        callback = ensureCallback(callback);

        let linkWith = Meteor[`linkWith${_.capitalize(serviceName)}`];
        if (!linkWith) {
            return callback(new Meteor.Error('no-service', `you may forget to install accounts-${serviceName} package.`));
        }
        linkWith(options, callback);
    },

    unlinkService(serviceName, options, callback) {
        options = _.extend({serviceName}, options);
        actions.unlinkService.invoke(options, ensureCallback(callback));
    }
});

function defaultCallback(err) {
    if (err) {
        console.error(err);
    }
}

function ensureCallback(callback) {
    return callback || defaultCallback;
}