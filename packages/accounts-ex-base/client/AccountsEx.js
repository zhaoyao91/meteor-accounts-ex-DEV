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

function defaultCallback(err) {
    if (err) {
        console.error(err);
    }
}

function ensureCallback(callback) {
    return callback || defaultCallback;
}

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
     * logout when all tabs are closed
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

    defaultCallback: defaultCallback,
    ensureCallback: ensureCallback,

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

// config onclose logout
{
    const tabId = Random.id();
    const openTabsKey = 'meteor-open-tabs';

    // record open tabs
    {
        $(window).on('load', function () {
            // add new tab record
            let tabs = getTabs();
            tabs[tabId] = (new Date).getTime();
            setTabs(tabs);
        });

        $(window).on('beforeunload', function () {
            // remove tab record
            let tabs = getTabs();
            delete tabs[tabId];
            setTabs(tabs);
        });
    }

    // fix open tabs records
    {
        const interval = 60 * 1000; // beat and fix every minute
        Meteor.setInterval(()=> {
            let tabs = getTabs();
            const now = (new Date).getTime();

            // beat new time
            tabs[tabId] = now;

            // remove incorrect tabs
            let newTabs = _.omit(tabs, time=>_.lt(time, now - interval));

            setTabs(newTabs);
        }, interval)
    }

    // logout if should
    {
        $(window).on('beforeunload', function () {
            let tabs = getTabs();
            let count = _.keys(tabs).length;
            let shouldLogout = Boolean(Meteor._localStorage.getItem(oncloseLogoutKey));
            if (!(count > 0) && shouldLogout) {
                AccountsEx.logout();
                Accounts.makeClientLoggedOut();
            }
        });
    }

    function getTabs() {
        let tabs = Meteor._localStorage.getItem(openTabsKey);
        if (tabs) {
            try {
                tabs = JSON.parse(tabs);
            }
            catch (err) {
                tabs = {};
            }
        }
        else {
            tabs = {};
        }
        return tabs;
    }

    function setTabs(tabs) {
        Meteor._localStorage.setItem(openTabsKey, JSON.stringify(tabs));
    }
}