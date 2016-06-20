/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
var variotry;
(function (variotry) {
    var KnockoutDecorator;
    (function (KnockoutDecorator) {
        function observable(target, propertyKey) {
            var v = target[propertyKey];
            var o = ko.observable(v);
            pushObservable(target, propertyKey, o);
            Object.defineProperty(target, propertyKey, {
                get: o,
                set: o
            });
        }
        KnockoutDecorator.observable = observable;
        function computed(extend) {
            return function (target, propertyKey, descriptor) {
                var getter = descriptor.get;
                var setter = descriptor.set;
                var c = ko.computed({
                    read: function () { return getter.call(target); },
                    write: setter ? function (v) { return setter.call(target, v); } : null
                });
                if (extend) {
                    c.extend(extend);
                }
                pushObservable(target, propertyKey, c);
                descriptor.get = c;
                if (setter) {
                    descriptor.set = c;
                }
            };
        }
        KnockoutDecorator.computed = computed;
        function getObservable(target, propertyKey) {
            var o = getObservableObject(target, propertyKey);
            return ko.isObservable(o) ? o : null;
        }
        KnockoutDecorator.getObservable = getObservable;
        function getComputed(target, propertyKey) {
            var c = getObservableObject(target, propertyKey);
            return ko.isComputed(c) ? c : null;
        }
        KnockoutDecorator.getComputed = getComputed;
        // #region no export
        var storeObservableKey = "__vtKnockoutObservables__";
        function pushObservable(target, propertyKey, o) {
            if (!target[storeObservableKey])
                target[storeObservableKey] = [];
            var store = target[storeObservableKey];
            store[propertyKey] = o;
        }
        function getObservableObject(target, propertyKey) {
            var store = target[storeObservableKey];
            if (!store)
                return null;
            return store[propertyKey];
        }
    })(KnockoutDecorator = variotry.KnockoutDecorator || (variotry.KnockoutDecorator = {}));
})(variotry || (variotry = {}));
