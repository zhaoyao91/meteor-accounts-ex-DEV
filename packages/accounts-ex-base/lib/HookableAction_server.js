// hookable sync action

HookableAction = class HookableAction {
    /**
     * @param options
     * @param [options.before(options1): options2]
     * @param options.action(options2): options3
     * @param [options.after(options3): result]
     */
    constructor(options) {
        this._before = ensureHook(options.before);
        this._after = ensureHook(options.after);
        this._action = options.action;

        checkFunction('before hook', this._before);
        checkFunction('inner action', this._action);
        checkFunction('after hook', this._after);
    }

    // in general, context should be the method invocation
    invoke(options, context) {
        options = this._before.call(context, options);
        options = this._action.call(context, options);
        options = this._after.call(context, options);
        return options;
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

function defaultHook(options) {
    return options;
}

function ensureHook(hook) {
    return hook || defaultHook;
}

function checkFunction(name, func) {
    if (!_.isFunction(func)) {
        throw new Error(`${name} must be a function`);
    }
}