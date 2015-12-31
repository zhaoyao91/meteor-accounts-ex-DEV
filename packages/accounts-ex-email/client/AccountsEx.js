const prefix = AccountsEx.methodPrefix;
const actions = {
    sendEmailVerifyCode: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Meteor.call(prefix + 'sendEmailVerifyCode', options, callback);
        }
    }),

    createUserWithEmail: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Accounts.callLoginMethod({
                methodName: prefix + 'createUserWithEmail',
                methodArguments: [options],
                userCallback: callback
            })
        }
    }),

    loginWithEmail: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Accounts.callLoginMethod({
                methodName: prefix + 'loginWithEmail',
                methodArguments: [options],
                userCallback: callback
            })
        }
    }),

    resetPasswordWithEmail: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Accounts.callLoginMethod({
                methodName: prefix + 'resetPasswordWithEmail',
                methodArguments: [options],
                userCallback: callback
            })
        }
    }),

    linkEmail: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Meteor.call(prefix + 'linkEmail', options, callback);
        }
    }),

    unlinkEmail: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Meteor.call(prefix + 'unlinkEmail', options, callback);
        }
    })
};

_.extend(AccountsEx._actions, actions);

_.extend(AccountsEx, {

    // standard apis

    sendEmailVerifyCode(options, callback) {
        actions.sendEmailVerifyCode.invoke(options, ensureCallback(callback));
    },

    createUserWithEmail(options, callback) {
        actions.createUserWithEmail.invoke(options, ensureCallback(callback))
    },

    loginWithEmail(options, callback) {
        actions.loginWithEmail.invoke(options, ensureCallback(callback))
    },

    resetPasswordWithEmail(options, callback) {
        actions.resetPasswordWithEmail.invoke(options, ensureCallback(callback))
    },

    linkEmail(options, callback) {
        actions.linkEmail.invoke(options, ensureCallback(callback))
    },

    unlinkEmail(options, callback) {
        actions.unlinkEmail.invoke(options, ensureCallback(callback))
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