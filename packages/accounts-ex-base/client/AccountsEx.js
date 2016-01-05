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

const oncloseLogoutKey = 'meteor-onclose-logout';
const openTabCountKey = 'meteor-open-tab-count';

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

    /**
     * 设置在所有窗口关闭时退出登录
     * @param {Boolean} setIt - default true
     */
    logoutOnClose(setIt = true) {
        if (setIt) {
            Meteor._localStorage.setItem(oncloseLogoutKey, true);
        }
        else {
            Meteor._localStorage.removeItem(oncloseLogoutKey);
        }
    },

    willLogoutOnClose() {
        return Boolean(Meteor._localStorage.getItem(oncloseLogoutKey))
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

// count open tabs
{
    $(window).on('load', function () {
        let count = Meteor._localStorage.getItem(openTabCountKey);
        count = count ? Number(count) + 1 : 1;
        Meteor._localStorage.setItem(openTabCountKey, count);
    });

    $(window).on('beforeunload', function () {
        Meteor._localStorage.setItem(openTabCountKey, Number(Meteor._localStorage.getItem(openTabCountKey)) - 1);
    });
}

// set onClose logout function
{
    $(window).on('beforeunload', function () {
        let count = Number(Meteor._localStorage.getItem(openTabCountKey));
        let shouldLogout = Boolean(Meteor._localStorage.getItem(oncloseLogoutKey));
        if (!(count > 0) && shouldLogout) {
            AccountsEx.logout();
            Accounts.makeClientLoggedOut();
        }
    });
}
