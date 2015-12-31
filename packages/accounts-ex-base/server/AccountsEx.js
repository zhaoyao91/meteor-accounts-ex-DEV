const userIdDef = {type: String};
const passwordDef = {type: String};

/// BCRYPT
var bcrypt = NpmModuleBcrypt;
var bcryptHash = Meteor.wrapAsync(bcrypt.hash);
var bcryptCompare = Meteor.wrapAsync(bcrypt.compare);
Accounts._bcryptRounds = 10;

AccountsEx = {
    methodPrefix: 'AccountsEx.methods.',
    publicationPrefix: 'AccountsEx.publications.',

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

    // helpers

    /**
     * create a user
     * @param [password]
     * @return userId
     */
    createUser(password) {
        var user = {services: {}};
        if (password) {
            let hashed = hashPassword(password);
            user.services.password = {bcrypt: hashed};
        }
        return Accounts.insertUserDoc({password}, user);
    },

    /**
     * @summary Forcibly change the password for a user.
     * @locus Server
     * @param {String} userId The id of the user to update.
     * @param {String} newPassword A new password for the user.
     * @param {Object} [options]
     * @param {Object} options.logout Logout all current connections with this userId (default: true)
     */
    setPassword(userId, newPassword, options) {
        options = _.extend({logout: true}, options);

        let update = {
            $set: {'services.password.bcrypt': hashPassword(newPassword)}
        };

        if (options.logout) {
            update.$unset = {'services.resume.loginTokens': 1};
        }

        Meteor.users.update({_id: userId}, update);
    },

    checkPassword(user, password){
        if (!user.services.password || !user.services.password.bcrypt) {
            throw new Meteor.Error('no-password', 'password is not set')
        }

        password = getPasswordString(password);
        if (!bcryptCompare(password, user.services.password.bcrypt)) {
            throw new Meteor.Error(403, "Incorrect password");
        }
    },

    VerifyCodes: VerifyCodes,

    // package apis

    _HookableAction: HookableAction,

    _actions: {
        login: new HookableAction({
            action: (function () {
                const schema = new SimpleSchema({
                    userId: userIdDef
                });
                return function ({userId}) {
                    schema.validate({userId});
                    return {userId}
                }
            }())
        }),

        resetPassword: new HookableAction({
            action: (function () {
                const schema = new SimpleSchema({
                    userId: userIdDef,
                    newPassword: passwordDef,
                    options: {
                        type: Object,
                        blackbox: true,
                        optional: true
                    }
                });
                return function ({userId, newPassword, options}) {
                    schema.validate({userId, newPassword, options});

                    let isCurrentUser = Meteor.user() && Meteor.userId() === userId;

                    AccountsEx.setPassword(userId, newPassword, options);

                    if (isCurrentUser) {
                        // reset token on connection
                        // important!, refer to Accounts.resetPassword
                        Accounts._setLoginToken(userId, this.connection, null);
                    }

                    return {userId};
                }
            }())
        })
    }
};

function getPasswordString(password) {
    if (typeof password === "string") {
        password = SHA256(password);
    } else { // 'password' is an object
        if (password.algorithm !== "sha-256") {
            throw new Error("Invalid password hash algorithm. " +
                "Only 'sha-256' is allowed.");
        }
        password = password.digest;
    }
    return password;
}

function hashPassword(password) {
    password = getPasswordString(password);
    return bcryptHash(password, Accounts._bcryptRounds);
}