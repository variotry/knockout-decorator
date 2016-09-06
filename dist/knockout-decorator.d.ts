/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
declare namespace variotry.KnockoutDecorator {
    /**
     * You can easily access KnockoubObservableArray functions via intellisense
     * by converting a array property which is attached @observableArray to this.
     */
    interface IObservableArray<T> extends Array<T> {
        /** Execute KnockoutObservableArray.replace */
        replace(oldItem: T, newItem: T): void;
        /** Execute KnockoutObservableArray.remove */
        remove(item: T): T[];
        /** Execute KnockoutObservableArray.remove */
        remove(removeFunction: (item: T) => boolean): T[];
        /** Execute KnockoutObservableArray.removeAll */
        removeAll(items: T[]): T[];
        /** Execute KnockoutObservableArray.removeAll */
        removeAll(): T[];
        /** Execute KnockoutObservableArray.destroy */
        destroy(item: T): void;
        /** Execute KnockoutObservableArray.destroy */
        destroy(destroyFunction: (item: T) => boolean): void;
        /** Execute KnockoutObservableArray.destroyAll */
        destroyAll(items: T[]): void;
        /** Execute KnockoutObservableArray.destroyAll */
        destroyAll(): void;
    }
    /**
     * @computed argument options.
     */
    interface IComputedOptions {
        pure?: boolean;
        deferEvaluation?: boolean;
        disposeWhen?(): boolean;
        disposeWhenNodeIsRemoved?: Node;
    }
    /**
     * Argument of @track decorator.
     */
    interface ITrackOptions {
        /**
         * Convert to pure computed if true or undefined, non pure computed otherwise.
         */
        pureComputed?: boolean;
        /**
         * Set name of method that you want to execute after a constructor.
         * You can get raw observable object using getObservable<T> and so on in the method.
         */
        initializeMethod?: string;
    }
    /**
     * Just attach to a class as decorator.
     * This decorator converts all properties and accessors to observable.
     * Points to consider.
     * 1. Have to initialize properties at place of declaration or in constructor to be recognized as observable.(set `null` is OK also)
     * 2. Have to set array value for array properties to be recognized as oservable array.
     *    If you first set null to a array property, the property will recognize as KnockoutObservable&lt;T[]>, not KnockoutObservableArray&lt;T>.
     * 3. Accessors will be converted to pure computed.
     *    If you want to use non pure computed, pass { pureComputed:true } to `@track`
     *    or attach `@computed` decorator to accessors.
     * 4. If you want to prevent properties or accessors from converting to observable,
     *    attach `@ignore` decorator to them.
     * 5. You can't get raw observable objects in a constructor.
     */
    function track(constructor: Function): any;
    /**
     * Just attach to a class as decorator.
     * This decorator converts all properties and accessors to observable.
     * Points to consider.
     * 1. Have to initialize properties at place of declaration or in constructor to be recognized as observable.(set `null` is OK also)
     * 2. Have to set array value for array properties to be recognized as oservable array.
     *    If you first set null to a array property, the property will recognize as KnockoutObservable<T[]>, not KnockoutObservableArray<T>.
     * 3. Accessors will be converted to pure computed.
     *    If you want to use non pure computed, pass { pureComputed:true } to `@track`
     *    or attach `@computed` decorator to accessors.
     * 4. If you want to prevent properties or accessors from converting to observable,
     *    attach `@ignore` decorator to them.
     * 5. You can't get raw observable objects in a constructor.
     */
    function track(options: ITrackOptions): any;
    /**
     * Just attach to a property or accessor as decorator.
     * This decorator prevents a property or a accessor from converting to observable in @track.
     */
    function ignore(_class: any, propertyName: string): void;
    /**
     * Just attach to a property as decorator.
     * If you change a property value, a view will also change. And vice versa.
     */
    function observable(_class: any, propertyName: string): void;
    /**
     * Just attach to a array property as decorator.
     * If you set a property to a new array data, a view will also change.
     * If you call a Array function such as push or pop, a view will also change.
     */
    function observableArray(_class: any, propertyName: string): void;
    /**
     * Just attach to a property accessor as decorator.
     * If a observable property value in the getter is changed, it will be called.
     * If you define also a setter, you can treat as writable computed.
     */
    function computed(_class: any, propertyName: string, descriptor: PropertyDescriptor): void;
    /**
     * Just attach to a property accessor as decorator.
     * @param options	Knockout computed options.
     * @see <a href="http://knockoutjs.com/documentation/computed-reference.html" target="_blank">Computed Observable Reference</a>
     */
    function computed(options: IComputedOptions): MethodDecorator;
    /**
     * Just attach to a property accessor as decorator.
     */
    function pureComputed(_class: any, propertyName: string, descriptor: PropertyDescriptor): void;
    /**
     * Just attach to a property or property accessor.
     * @extend require attaching observable decorator.
     * @param options	Set parameter which define ko.extenders such as rateLimit.
     */
    function extend(options: {
        [key: string]: any;
    }): any;
    /**
     * Attach to a property or accessor(setter).
     * When you set a value to a property or a setter, the value will be changed through filters.
     * If there is more than one filter, filters are executed in the order from bottom to top.
     * @param filterFunc function that return a processed value.
     */
    function setFilter(filterFunc: (setValue: any) => any): any;
    /**
     * Attach to a number type property or setter.
     * This decorator convert to number type if set a value other than number type such as value is changed via input element on a browser.
     * If a converted value is NaN, it handles as zero.
     * @extend require attaching observable decorator.
     */
    function asNumber(_class: any, propertyName: string): void;
    /**
     * Get raw knockout observable object.
     * @param instancedObj	Instanced object.
     * @param propertyName		Name of a property which is attached the @observable.
     * @return If found then KnockoutObservable object, else null.
     */
    function getObservable<T>(instancedObj: any, propertyName: string): KnockoutObservable<T>;
    /**
     * Get row knockout observable array object.
     * @param instancedObj	Instanced object.
     * @param propertyName		Name of a property which is attached the @observableArray.
     */
    function getObservableArray<T>(instancedObj: any, propertyName: string): KnockoutObservableArray<T>;
    /**
     * Get raw knockout computed object.
     * @param instancedObj	Instanced object.
     * @param propertyName		Name of a property which is attached the @computed.
     * @return If found then KnockoutComputed object, else null.
     */
    function getComputed<T>(instancedObj: any, propertyName: string): KnockoutComputed<T>;
}
