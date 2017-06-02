/// <reference types="knockout" />
/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
declare module KnockoutDecorator {
    /**
     * You can easily access KnockoubObservableArray functions via intellisense
     * by casting a array property which is attaching @observableArray.
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
        disposeWhenNodeIsRemoved?: Node;
        disposeWhen?(): boolean;
        deferEvaluation?: boolean;
        pure?: boolean;
    }
    /**
     * Argument of @track decorator.
     */
    interface ITrackOptions {
        /**
         * Make accessors pure koComputed if true or undefined, else non pure koComputed.
         */
        pureComputed?: boolean;
        /**
         * Deprecated. Use init instead.
         * If value set, perform obj[initializeMethod]() immediate after executed constructor.
         */
        initializeMethod?: string;
        /**
         * If value set, perform obj[init]() immediate after executed constructor.
         * In order to use raw koObservable if you use track decorator,
         * it is necessary to be not inside constructor but after executed constructor.
         */
        init?: string;
        [key: string]: any;
    }
    /**
     * Class decorator.
     * Make all properties/accessors to koObservable/koComputed.
     * Points to consider.
     * 1. Properties that are not initialized at declare or in constructor don't become koObservable.
     * 2. In order to recognize a array property as koObservableArray, it is necessary to set a array value first(e.g set [] ).
     * 3. Accessors become pure koComputed.
     * 4. A property/accessor with `@ignore` don't become koObservable.
     * 5. In order to use raw koObservable, it is necessary to be not inside constructor but after executed constructor.
     */
    function track(constructor: Function): any;
    /**
     * Class decorator.
     * Make all properties/accessors to koObservable/koComputed.
     * Points to consider.
     * 1. Properties that are not initialized at declare or in constructor don't become koObservable.
     * 2. In order to recognize a array property as koObservableArray, it is necessary to set a array value first(e.g set [] ).
     * 3. Accessors become pure koComputed.
     * 4. A property/accessor with `@ignore` don't become koObservable.
     * 5. In order to use raw koObservable, it is necessary to be not inside constructor but after executed constructor.
     */
    function track(options: ITrackOptions): any;
    /**
     * Property/Accessor decorator.
     * Prevent a property/accessor from making koObservable in @trak.
     */
    function ignore(target: any, property: string): void;
    /**
     * Property decorator.
     * Make a property koObservable.
     */
    function observable(prototype: Object, property: string): void;
    /**
     * Property decorator.
     * Make a property koObservableArray.
     */
    function observableArray(prototype: any, property: string): void;
    /**
     * Accessor decorator.
     * At least require getter.
     * Make a accessor koComputed. If setter is defined, make it writable computed.
     */
    function computed(prototype: any, propertyName: string, descriptor: PropertyDescriptor): void;
    /**
     * Accessor decorator.
     * At least require getter.
     * Make a accessor koComputed. If setter is defined, make it writable computed.
     * @param options	Knockout computed options.
     * @see <a href="http://knockoutjs.com/documentation/computed-reference.html" target="_blank">Computed Observable Reference</a>
     */
    function computed(options: IComputedOptions): MethodDecorator;
    /**
     * Accessor decorator.
     * At least require getter.
     * Make a accessor koPureComputed. If setter is defined, make it writable computed.
     */
    function pureComputed(prototype: any, propertyName: string, descriptor: PropertyDescriptor): void;
    /**
     * Property/Accessor decorator.
     * @param options	Set options which is defined ko.extenders such as rateLimit.
     */
    function extend(options: {
        [key: string]: any;
    }): any;
    /**
     * Property/Setter decorator.
     * A value set to a property becom return value of filter.
     * If there is multiple set filter decorators for a property, there are executed in the order from bottom to top.
     * @param filterFunc function that return a processed value.
     */
    function setFilter(filterFunc: (setValue: any) => any): any;
    /**
     * Set filter decorator.
     * Variable keeps numerical type.
     * If set value is NaN, it become zero.
     */
    function asNumber(prototype: any, property: string): any;
    /**
     * Set filter decorator.
     * Variable keeps greater than or equal to minValue.
     */
    function min(minValue: number): any;
    /**
     * Set filter decorator.
     * Variable keeps less than or equal to maxValue.
     * @extend require attaching observable decorator.
     */
    function max(maxValue: number): any;
    /**
     * Set filter decorator.
     * Variable keeps between minValue and maxValue inclusive.
     */
    function clamp(minValue: number, maxValue: number): any;
    /**
     * Get raw knockout observable object.
     * @param target	Target object.
     * @param property	Name of a property which is attached the @observable.
     * @return If found then KnockoutObservable object, else null.
     */
    function getObservable<T>(target: any, property: string): KnockoutObservable<T>;
    /**
     * Get raw knockout observable object.
     * @param propertyAccess	execute propety access. e.g. "() => this.property".
     */
    function getObservable<T>(propertyAccess: () => T): KnockoutObservable<T>;
    /**
     * Get row knockout observable array object.
     * @param target	Target object.
     * @param property	Name of a property which is attached the @observableArray.
     */
    function getObservableArray<T>(target: any, property: string): KnockoutObservableArray<T>;
    /**
     * Get row knockout observable array object.
     * @param propertyAccess	execute propety access. e.g. "() => this.property".
     */
    function getObservableArray<T>(propertyAccess: () => T[]): KnockoutObservableArray<T>;
    /**
     * Get raw knockout computed object.
     * @param target	Target object.
     * @param property	Name of a accessor which is attached the @computed.
     * @return If found then KnockoutComputed object, else null.
     */
    function getComputed<T>(target: any, accessor: string): KnockoutComputed<T>;
    /**
     * Get raw knockout computed object.
     * @param getterAccess	execute getter. e.g. "() => this.getter".
     * @return If found then KnockoutComputed object, else null.
     */
    function getComputed<T>(getterAccess: () => T): KnockoutComputed<T>;
}
export = KnockoutDecorator;
export as namespace KnockoutDecorator