import * as ko from "knockout";
/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
export declare namespace KnockoutDecorator {
    /**
     * Provide for accessing methods defined on Knockout ObservableArray.
     * Specify this for array properties of @track class and properties with @observableArray.
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
     * Optional argument of @computed decorator.
     * See KnockoutComputedOptions<T>.
     */
    interface IComputedOptions {
        disposeWhenNodeIsRemoved?: Node;
        disposeWhen?(): boolean;
        deferEvaluation?: boolean;
        pure?: boolean;
    }
    /**
     * Optional argument of @track decorator.
     */
    interface ITrackOptions {
        /**
         * Become accessors pure computed if true or undefined, else non-pure computed.
         */
        pureComputed?: boolean | undefined;
        /**
         * If value set, perform obj[init]() immediate after constructor.
         * It is possible to access raw koObservables using getObservable() etc.
         */
        init?: string | undefined;
        [key: string]: any;
    }
    /**
     * Class decorator.
     * Become all properties/accessors Observable/Computed.
     * Points to consider.
     * 1. In order to use an array property as ObservableArray, it is necessary to set an array value(e.g. []) when declare the property or inside constructor.
     * 2. Accessors become (Pure) Computed.
     * 3. A property/accessor with `@ignore` decorator don't become Observable.
     * 4. It is impossible to access Raw koObservables until the constructor has completed.
     */
    function track<T extends {
        new (...args: any[]): {};
    }>(constructor: T): any;
    function track(options: ITrackOptions): any;
    /**
     * Property and Accessor decorator.
     * Prevent a property/accessor from becoming observable in @track class.
     */
    function ignore(target: any, property: string): void;
    /**
     * Property decorator.
     * A property become koObservable.
     */
    function observable(prototype: Object, property: string): void;
    /**
     * Property decorator.
     * A property become koObservableArray.
     */
    function observableArray(prototype: any, property: string): void;
    /**
     * Accessor decorator.
     * At least require getter. (Not allow setter only)
     * An accessor become koComputed. If setter is defined, make it writable computed.
     */
    function computed(prototype: any, propertyName: string, descriptor: PropertyDescriptor): void;
    /**
     * Accessor decorator.
     * At least require getter. (Not allow setter only)
     * An accessor become koComputed. If setter is defined, make it writable computed.
     * @param options Knockout computed options.
     * See <a href="http://knockoutjs.com/documentation/computed-reference.html" target="_blank">Computed Observable Reference</a>
     */
    function computed(options: IComputedOptions): MethodDecorator;
    /**
     * Accessor decorator.
     * At least require getter. (Not allow setter only)
     * An accessor become koPureComputed. If setter is defined, make it writable computed.
     */
    function pureComputed(prototype: any, propertyName: string, descriptor: PropertyDescriptor): void;
    /**
     * Property and Accessor decorator.
     * @param options    Set options that can be used ko.extend, such as rateLimit.
     */
    function extend(options: {
        [key: string]: any;
    }): any;
    /**
     * Property and Setter decorator.
     * A value set to a property become return value of via filter.
     * If defined multiple set filter decorators for a property, there are executed in the order from bottom to top.
     * @param filterFunc function that return a processed value.
     */
    function setFilter<T>(filterFunc: (setValue: T) => T): any;
    /**
     * Property and Setter decorator.
     * Variable keeps numerical type.
     * If set value is NaN, it becomes zero.
     */
    function asNumber(prototype: any, property: string): void;
    /**
     * Property and Setter decorator.
     * Variable keeps greater than or equal to minValue.
     */
    function min(minValue: number): number;
    /**
     * Property and Setter decorator.
     * Variable keeps less than or equal to maxValue.
     * @extend require attaching observable decorator.
     */
    function max(maxValue: number): number;
    /**
     * Property and Setter decorator.
     * Variable keeps between minValue and maxValue inclusive.
     */
    function clamp(minValue: number, maxValue: number): number;
    /**
     * Get raw knockout observable object.
     * @param target    Target object.
     * @param property     Property name which is attaching @observable decorator.
     * @return If found then return KnockoutObservable object, else null.
     */
    function getObservable<T>(target: any, property: string): ko.Observable<T>;
    /**
     * Get raw knockout observable object.
     * getObservable( () => this.prop ) equals getObservable( this, 'prop' ).
     * Recommend using this.
     * @param propertyAccess    execute property access. e.g. "() => this.property".
     */
    function getObservable<T>(propertyAccess: () => T): ko.Observable<T>;
    /**
     * Get row knockout observable array object.
     * @param target    Target object.
     * @param property     Property name which is attaching @observableArray decorator.
     */
    function getObservableArray<T>(target: any, property: string): ko.ObservableArray<T>;
    /**
     * Get row knockout observable array object.
     * @param propertyAccess    execute property access. e.g. "() => this.property".
     */
    function getObservableArray<T>(propertyAccess: () => T[]): ko.ObservableArray<T>;
    /**
     * Get raw knockout computed object.
     * @param target    Target object.
     * @param accessor    Accessor name which is attached the @computed decorator.
     * @return If found then KnockoutComputed object, else null.
     */
    function getComputed<T>(target: any, accessor: string): ko.Computed<T>;
    /**
     * Get raw knockout computed object.
     * getComputed( () => this.getter ) equals getComputed( this, 'getter' ).
     * @param getterAccess    execute getter. e.g. "() => this.getter".
     * @return If found then KnockoutComputed object, else null.
     */
    function getComputed<T>(getterAccess: () => T): ko.Computed<T>;
}
export default KnockoutDecorator;
