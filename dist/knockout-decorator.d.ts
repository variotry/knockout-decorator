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
     * Just attach to a property as decorator.
     * If you change a property value, a view will also change. And vice versa.
     */
    function observable(target: any, propertyName: string): void;
    /**
     * Just attach to a array property as decorator.
     * If you set a property to a new array data, a view will also change.
     * If you call a Array function such as push or pop, a view will also change.
     */
    function observableArray(target: any, propertyName: string): void;
    /**
     * Just attach to a property accessor as decorator.
     * If a observable property value in the getter is changed, it will be called.
     * If you define also a setter, you can treat as writable computed.
     */
    function computed(target: any, propertyName: string, descriptor: PropertyDescriptor): void;
    /**
     * Just attach to a property accessor as decorator.
     * @param options	Knockout computed options.
     * @see <a href="http://knockoutjs.com/documentation/computed-reference.html" target="_blank">Computed Observable Reference</a>
     */
    function computed(options: IComputedOptions): MethodDecorator;
    /**
     * Just attach to a property accessor as decorator.
     */
    function pureComputed(target: any, propertyName: string, descriptor: PropertyDescriptor): void;
    /**
     * Just attach to a property or property accessor.
     * @extend require attaching observable decorator.
     * @param options	Set parameter which define ko.extenders such as rateLimit.
     */
    function extend(options: {
        [key: string]: any;
    }): any;
    /**
     * Just attach to a number type property.
     * Convert to number type if set a value other than number type such as via input element on a browser.
     * If the converted value is nan, it treat as zero.
     * @extend require attaching observable decorator.
     */
    function asNumber(target: any, propertyName: string): void;
    /**
     * Get raw knockout observable object.
     * @param target	Instance object.
     * @param propertyName		Name of a property which is attached the @observable.
     * @return If found then KnockoutObservable object, else null.
     */
    function getObservable<T>(target: any, propertyName: string): KnockoutObservable<T>;
    /**
     * Get row knockout observable array object.
     * @param target	Instance object.
     * @param propertyName		Name of a property which is attached the @observableArray.
     */
    function getObservableArray<T>(target: any, propertyName: string): KnockoutObservableArray<T>;
    /**
     * Get raw knockout computed object.
     * @param target	Instance object.
     * @param propertyName		Name of a property which is attached the @computed.
     * @return If found then KnockoutComputed object, else null.
     */
    function getComputed<T>(target: any, propertyName: string): KnockoutComputed<T>;
}
