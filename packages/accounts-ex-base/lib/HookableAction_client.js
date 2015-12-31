// hookable async action

HookableAction = class HookableAction {
    /**
     * @param options
     * @param [options.before(options1, callback(err, options2))]
     * @param options.action(err, options2, callback(err, options3))
     * @param [options.after(err, options3, callback(err, result))]
     */
    constructor(options) {
        this._before = options.before || defaultBeforeHook;
        this._after = options.after || defaultAfterHook;
        this._action = options.action;

        checkFunction('before hook', this._before);
        checkFunction('inner action', this._action);
        checkFunction('after hook', this._after);
    }

    /**
     * @param options
     * @param [callback(err, result)]
     */
    invoke(options, callback) {
        let self = this;
        this._before(options, function (err, options) {
            self._action(err, options, function (err, options) {
                self._after(err, options, function (err, result) {
                    if (callback) callback(err, result);
                })
            })
        });
    }

    /**
     * cannot config inner action
     * @param options
     */
    config(options) {
        if (options.before) {
            checkFunction('before hook', options.before);
            this._before = options.before;
        }
        if (options.after) {
            checkFunction('after hook', options.after);
            this._after = options.after;
        }
    }
};

function defaultBeforeHook(options, callback) {
    return callback(null, options);
}

function defaultAfterHook(err, options, callback) {
    return callback(err, options);
}

function checkFunction(name, func) {
    if (!_.isFunction(func)) {
        throw new Error(`${name} must be a function`);
    }
}