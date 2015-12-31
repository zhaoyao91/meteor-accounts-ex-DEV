const prefix = 'AccountsEx.methods.';
const actions = {
    login: new HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Accounts.callLoginMethod({
                methodName: prefix + 'login',
                methodArguments: [options],
                userCallback: callback
            })
        }
    }),

    resetPassword: new HookableAction({
        action(err, options, callback){
            if (err) return callback(err);
            Accounts.callLoginMethod({
                methodName: prefix + 'resetPassword',
                methodArguments: [options],
                userCallback: callback
            })
        }
    })
};

AccountsEx = {
    methodPrefix: prefix,
    publicationPrefix: 'AccountsEx.publications.',

    // client apis

    login(options, callback) {
        actions.login.invoke(options, ensureCallback(callback))
    },

    logout(callback) {
        Meteor.logout(ensureCallback(callback));
    },

    resetPassword(options, callback) {
        actions.resetPassword.invoke(options, ensureCallback(callback));
    },

    // helpers

    hashPassword(password) {
        return {
            digest: SHA256(password),
            algorithm: "sha-256"
        };
    },

    // config apis

    /**
     * @param options
     * @param options.$action
     * @param [options.$action.before]
     * @param [options.$action.after]
     */
    setActionHooks(options) {
        _.forEach(options, (hooks, action) => {
            this._actions[action].config(hooks);
        })
    },

    // package apis

    _HookableAction: HookableAction,

    _actions: actions
};

function defaultCallback(err) {
    if (err) {
        console.error(err);
    }
}

function ensureCallback(callback) {
    return callback || defaultCallback;
}