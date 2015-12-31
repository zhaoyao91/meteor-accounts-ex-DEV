const prefix = AccountsEx.methodPrefix;
const actions = {
    sendPhoneVerifyCode: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Meteor.call(prefix + 'sendPhoneVerifyCode', options, callback);
        }
    }),

    createUserWithPhone: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Accounts.callLoginMethod({
                methodName: prefix + 'createUserWithPhone',
                methodArguments: [options],
                userCallback: callback
            })
        }
    }),

    loginWithPhone: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Accounts.callLoginMethod({
                methodName: prefix + 'loginWithPhone',
                methodArguments: [options],
                userCallback: callback
            })
        }
    }),

    resetPasswordWithPhone: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Accounts.callLoginMethod({
                methodName: prefix + 'resetPasswordWithPhone',
                methodArguments: [options],
                userCallback: callback
            })
        }
    }),

    linkPhone: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Meteor.call(prefix + 'linkPhone', options, callback);
        }
    }),

    unlinkPhone: new AccountsEx._HookableAction({
        action(err, options, callback) {
            if (err) return callback(err);
            Meteor.call(prefix + 'unlinkPhone', options, callback);
        }
    })
};

_.extend(AccountsEx._actions, actions);

_.extend(AccountsEx, {

    // standard apis

    sendPhoneVerifyCode(options, callback) {
        actions.sendPhoneVerifyCode.invoke(options, ensureCallback(callback));
    },

    createUserWithPhone(options, callback) {
        actions.createUserWithPhone.invoke(options, ensureCallback(callback))
    },

    loginWithPhone(options, callback) {
        actions.loginWithPhone.invoke(options, ensureCallback(callback))
    },

    resetPasswordWithPhone(options, callback) {
        actions.resetPasswordWithPhone.invoke(options, ensureCallback(callback))
    },

    linkPhone(options, callback) {
        actions.linkPhone.invoke(options, ensureCallback(callback))
    },

    unlinkPhone(options, callback) {
        actions.unlinkPhone.invoke(options, ensureCallback(callback))
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