/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
var variotry;
(function (variotry) {
    var KnockoutDecorator;
    (function (KnockoutDecorator) {
        // #endregion
        /**
         * Just attach to a property as decorator.
         * If you change a property value, a view will also change. And vice versa.
         */
        function observable(target, propertyName) {
            var o = ko.observable();
            pushObservable(target, propertyName, o);
            Object.defineProperty(target, propertyName, {
                get: o,
                set: o
            });
        }
        KnockoutDecorator.observable = observable;
        /**
         * Just attach to a array property as decorator.
         * If you set a property to a new array data, a view will also change.
         * If you call a Array function such as push or pop, a view will also change.
         */
        function observableArray(target, propertyName) {
            var o = ko.observableArray();
            function replaceFunction(src) {
                var originals = {};
                ["splice", "pop", "push", "shift", "unshift", "reverse", "sort"].forEach(function (fnName) {
                    originals[fnName] = src[fnName];
                    var mimicry = function () {
                        // restore the original function for call it inside ObservableArray.
                        src[fnName] = originals[fnName];
                        // call ObservableArray function
                        var res = o[fnName].apply(o, arguments);
                        // rewrite the original function again.
                        src[fnName] = mimicry;
                        return res;
                    };
                    // rewrite the original function
                    src[fnName] = mimicry;
                });
            }
            function mergeFunction(src) {
                ["replace", "remove", "removeAll", "destroy", "destroyAll"].forEach(function (fnName) {
                    src[fnName] = function () {
                        return o[fnName].apply(o, arguments);
                    };
                });
            }
            pushObservable(target, propertyName, o);
            Object.defineProperty(target, propertyName, {
                get: o,
                set: function (newArray) {
                    if (newArray && Array.isArray(newArray) === false) {
                        throw target["constructor"].name + "." + propertyName + " attached the observableArray decorator must be array.";
                    }
                    replaceFunction(newArray);
                    mergeFunction(newArray);
                    o(newArray);
                }
            });
        }
        KnockoutDecorator.observableArray = observableArray;
        function computed() {
            if (arguments.length == 1) {
                return getComputedDecoratorFactory(arguments[0]);
            }
            getComputedDecoratorFactory(null).apply(this, arguments);
        }
        KnockoutDecorator.computed = computed;
        /**
         * Just attach to a property accessor as decorator.
         */
        function pureComputed(target, propertyName, descriptor) {
            getComputedDecoratorFactory({ pure: true })(target, propertyName, descriptor);
        }
        KnockoutDecorator.pureComputed = pureComputed;
        /**
         * Just attach to a property or property accessor.
         * @extend require attaching observable decorator.
         * @param options	Set parameter which define ko.extenders such as rateLimit.
         */
        function extend(options) {
            return function (target, propertyName, descriptor) {
                var o = getObservableObject(target, propertyName);
                if (!o) {
                    // I try get observable object again
                    // to get it if @extend is attached after observable decorator.
                    setTimeout(function () {
                        o = getObservableObject(target, propertyName);
                        if (o) {
                            o.extend(options);
                        }
                        else {
                            var msg = "Can't get observable object from '";
                            msg += target["constructor"].name + "." + propertyName + "'.\n";
                            msg += "In order to use @extend need attach observable decorator.";
                            console.error(msg);
                        }
                    });
                    return;
                }
                o.extend(options);
            };
        }
        KnockoutDecorator.extend = extend;
        /**
         * Get raw knockout observable object.
         * @param target	Instance object.
         * @param propertyName		Name of a property which is attached the @observable.
         * @return If found then KnockoutObservable object, else null.
         */
        function getObservable(target, propertyName) {
            var o = getObservableObject(target, propertyName);
            return (ko.isObservable(o) && o.indexOf === undefined) ? o : null;
        }
        KnockoutDecorator.getObservable = getObservable;
        /**
         * Get row knockout observable array object.
         * @param target	Instance object.
         * @param propertyName		Name of a property which is attached the @observableArray.
         */
        function getObservableArray(target, propertyName) {
            var o = getObservableObject(target, propertyName);
            return (ko.isObservable(o) && o.indexOf !== undefined) ? o : null;
        }
        KnockoutDecorator.getObservableArray = getObservableArray;
        /**
         * Get raw knockout computed object.
         * @param target	Instance object.
         * @param propertyName		Name of a property which is attached the @computed.
         * @return If found then KnockoutComputed object, else null.
         */
        function getComputed(target, propertyName) {
            var c = getObservableObject(target, propertyName);
            return ko.isComputed(c) ? c : null;
        }
        KnockoutDecorator.getComputed = getComputed;
        // #region no export
        /** @private */
        var storeObservableKey = "__vtKnockoutObservables__";
        /** @private */
        function pushObservable(target, propertyName, o) {
            if (!target[storeObservableKey])
                target[storeObservableKey] = {};
            target[storeObservableKey][propertyName] = o;
        }
        /** @private */
        function getObservableObject(target, propertyName) {
            var store = target[storeObservableKey];
            if (!store)
                return null;
            return store[propertyName];
        }
        /** @private */
        function getComputedDecoratorFactory(options) {
            return function (target, propertyName, descriptor) {
                var getter = descriptor.get;
                if (!getter) {
                    throw "@Computed and @pureComputed require getter.";
                }
                var setter = descriptor.set;
                var computedOptions = {
                    read: getter,
                    write: setter,
                    owner: target
                };
                if (options) {
                    for (var key in options) {
                        if (typeof options[key] === "function") {
                            var fn = options[key];
                            options[key] = function () {
                                fn.apply(target, arguments);
                            };
                        }
                        computedOptions[key] = options[key];
                    }
                }
                var c = ko.computed(computedOptions);
                pushObservable(target, propertyName, c);
                if (getter) {
                    descriptor.get = c;
                }
                if (setter) {
                    descriptor.set = c;
                }
            };
        }
    })(KnockoutDecorator = variotry.KnockoutDecorator || (variotry.KnockoutDecorator = {}));
})(variotry || (variotry = {}));
