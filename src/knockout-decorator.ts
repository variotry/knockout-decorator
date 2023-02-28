import * as ko from "knockout";

/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
export namespace KnockoutDecorator
{
    // #region declare interfaces.
    /**
     * Provide for accessing methods defined on Knockout ObservableArray.
     * Specify this for array properties of @track class and properties with @observableArray.
     */
    export interface IObservableArray<T> extends Array<T>
    {
        /** Execute KnockoutObservableArray.replace */
        replace( oldItem: T, newItem: T ): void;

        /** Execute KnockoutObservableArray.remove */
        remove( item: T ): T[];

        /** Execute KnockoutObservableArray.remove */
        remove( removeFunction: ( item: T ) => boolean ): T[];

        /** Execute KnockoutObservableArray.removeAll */
        removeAll( items: T[] ): T[];

        /** Execute KnockoutObservableArray.removeAll */
        removeAll(): T[];

        /** Execute KnockoutObservableArray.destroy */
        destroy( item: T ): void;

        /** Execute KnockoutObservableArray.destroy */
        destroy( destroyFunction: ( item: T ) => boolean ): void;

        /** Execute KnockoutObservableArray.destroyAll */
        destroyAll( items: T[] ): void;

        /** Execute KnockoutObservableArray.destroyAll */
        destroyAll(): void;
    }

    /**
     * Optional argument of @computed decorator.
     * See KnockoutComputedOptions<T>.
     */
    export interface IComputedOptions
    {
        disposeWhenNodeIsRemoved?: Node;
        disposeWhen?(): boolean;
        deferEvaluation?: boolean;
        pure?: boolean;
    }
    // #endregion

    /**
     * Optional argument of @track decorator.
     */
    export interface ITrackOptions
    {
        /**
         * Become accessors pure computed if true or undefined, else non-pure computed.
         */
        pureComputed?: boolean | undefined,

        /**
         * If value set, perform obj[init]() immediate after constructor.
         * It is possible to access raw koObservables using getObservable() etc.
         */
        init?: string | undefined;

        [ key: string ]: any
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
    export function track<T extends { new( ...args: any[] ): {} }>( constructor: T ) : any;
    export function track( options: ITrackOptions ): any;
    export function track( arg: any ): any
    {
        let options: ITrackOptions;
        if ( typeof arg === "function" )
        {
            options = {
                pureComputed: true,
            };
        }
        else
        {
            options = arg;
            let defaults = {
                pureComputed: true,
            } as ITrackOptions;
            if ( !options )
            {
                options = defaults;
            }
            else
            {
                for ( let key in defaults )
                {
                    if ( options[ key ] === undefined )
                    {
                        options[ key ] = defaults[ key ];
                    }
                }
            }
        }


        function classFactory<T extends { new( ...args: any[] ): {} }>( constructor: T ) : any
        {
            let kd = KnockoutDecoratorClassInfo.Get( constructor );

            // クラスデコレータを構築するにあたって、
            // 引数constructorをnewせずに呼ぶ方法がなくなり(constructor.apply(...)が利用不可）
            // クラスを継承する形でカスタマイズする流れとなった模様
            const DecoratorConstructor = class extends constructor
            {
                // console.log( thisObj ) とした場合の クラス名としての表記内容
                [Symbol.toStringTag] = `kd${constructor.name}`;

                public constructor( ...args: any[] )
                {
                    super( ...args );

                    let o : any = this;

                    let properties = Object.keys( o );
                    let len = properties.length;
                    for ( let i = 0; i < len; ++i )
                    {
                        let p = properties[ i ];
                        if ( p === KnockoutDecoratorObjInfo.Key ||
                            kd.isIgnoreProperty( p ) ||
                            getObservable( o, p ) ||
                            getObservableArray( o, p ) )
                        {
                            continue;
                        }

                        let v = o[ p ];
                        delete o[ p ];
                        if ( Array.isArray( v ) )
                        {
                            observableArray( DecoratorConstructor.prototype, p );
                        }
                        else
                        {
                            observable( DecoratorConstructor.prototype, p );
                        }
                        o[ p ] = v;
                    }

                    let functions = Object.keys( constructor.prototype );
                    let computedAccessors: any[] = [];
                    len = functions.length;
                    for ( let i = 0; i < len; ++i )
                    {
                        let f = functions[ i ];
                        let d = Object.getOwnPropertyDescriptor( constructor.prototype, f );
                        if ( !d || !d.get ) continue;
                        if ( kd.isIgnoreProperty( f ) ) continue;

                        // If be Overridden descriptor already, accessor make computed by executing the following;
                        let dummy = o[ f ];
                        if ( getComputed( o, f ) ) continue;

                        let factory = getComputedDecoratorFactory( {
                            pure: options.pureComputed
                        } );
                        factory( DecoratorConstructor.prototype, f, d );
                        Object.defineProperty( DecoratorConstructor.prototype, f, d );
                        computedAccessors.push( f );
                    }
                    // In order to become koComputed, call getter.
                    len = computedAccessors.length;
                    for ( let i = 0; i < len; ++i )
                    {
                        let dummy = o[ computedAccessors[ i ] ];
                    }

                    if ( options.init && typeof o[ options.init ] === "function" )
                    {
                        o[ options.init ]();
                    }
                }
            };
            Object.defineProperty(DecoratorConstructor, "name", {
                get: () => `kd${constructor.name}`
            });
            return DecoratorConstructor;
        }

        if ( typeof arg === "function" )
        {
            return classFactory( arg );
        }
        else
        {
            return function<T extends { new( ...args: any[] ): {} }>( constructor: T ) {
                return classFactory( constructor );
            }
        }
    }

    /**
     * Property and Accessor decorator.
     * Prevent a property/accessor from becoming observable in @track class.
     */
    export function ignore( target: any, property: string ): void
    {
        KnockoutDecoratorClassInfo.Get( target ).pushIgnoreProperty( property );
    }

    /**
     * Property decorator.
     * A property become koObservable.
     */
    export function observable( prototype: Object, property: string ): void
    {
        Object.defineProperty( prototype, property, {
            get: function (): any {
                KnockoutDecoratorObjInfo.Get( this ).makeObservable( property );
                return this[ property ];
            },
            set: function ( value: any ): void {
                KnockoutDecoratorObjInfo.Get( this ).makeObservable( property );
                this[ property ] = value;
            }
        } );
    }

    /**
     * Property decorator.
     * A property become koObservableArray.
     */
    export function observableArray( prototype: any, property: string ): void
    {
        Object.defineProperty( prototype, property, {
            get: function (): any[] {
                KnockoutDecoratorObjInfo.Get( this ).makeObservableArray( property );
                return this[ property ];
            },
            set: function ( arrayValue: any ): void {
                KnockoutDecoratorObjInfo.Get( this ).makeObservableArray( property );
                this[ property ] = arrayValue;
            }
        } );
    }

    /**
     * Accessor decorator.
     * At least require getter. (Not allow setter only)
     * An accessor become koComputed. If setter is defined, make it writable computed.
     */
    export function computed( prototype: any, propertyName: string, descriptor: PropertyDescriptor ): void
    /**
     * Accessor decorator.
     * At least require getter. (Not allow setter only)
     * An accessor become koComputed. If setter is defined, make it writable computed.
     * @param options Knockout computed options.
     * See <a href="http://knockoutjs.com/documentation/computed-reference.html" target="_blank">Computed Observable Reference</a>
     */
    export function computed( options: IComputedOptions ): MethodDecorator;
    export function computed(): any
    {
        if ( arguments.length == 1 )
        {
            return getComputedDecoratorFactory( arguments[ 0 ] );
        }
        // @ts-ignore
        getComputedDecoratorFactory( null ).apply( this, arguments );
    }

    /**
     * Accessor decorator.
     * At least require getter. (Not allow setter only)
     * An accessor become koPureComputed. If setter is defined, make it writable computed.
     */
    export function pureComputed( prototype: any, propertyName: string, descriptor: PropertyDescriptor ): void
    {
        getComputedDecoratorFactory( { pure: true } )( prototype, propertyName, descriptor );
    }

    /**
     * Property and Accessor decorator.
     * @param options    Set options that can be used ko.extend, such as rateLimit.
     */
    export function extend( options: { [key: string]: any } ): any
    {
        return ( prototype: any, name: string, descriptor?: PropertyDescriptor ) => {
            KnockoutDecoratorClassInfo.Get( prototype ).pushKoExtend( name, options );
        };
    }

    //#region set value filter decorators
    /**
     * Property and Setter decorator.
     * A value set to a property become return value of via filter.
     * If defined multiple set filter decorators for a property, there are executed in the order from bottom to top.
     * @param filterFunc function that return a processed value.
     */
    export function setFilter<T>( filterFunc: ( setValue: T ) => T ): any
    {
        return ( prototype: any, property: string ) => {
            KnockoutDecoratorClassInfo.Get( prototype ).pushSetFilter( property, filterFunc );
        };
    }

    /**
     * Property and Setter decorator.
     * Variable keeps numerical type.
     * If set value is NaN, it becomes zero.
     */
    export function asNumber( prototype: any, property: string ): void
    {
        KnockoutDecoratorClassInfo.Get( prototype ).pushSetFilter( property, v => {
            if ( !v || typeof v === "number" ) return v;
            v = parseFloat( v );
            return isNaN( v ) ? 0 : v;
        } );
    }

    /**
     * Property and Setter decorator.
     * Variable keeps greater than or equal to minValue.
     */
    export function min( minValue: number ): any
    {
        return setFilter<number>( v => v < minValue ? minValue : v );
    }

    /**
     * Property and Setter decorator.
     * Variable keeps less than or equal to maxValue.
     * @extend require attaching observable decorator.
     */
    export function max( maxValue: number ): any
    {
        return setFilter<number>( v => v > maxValue ? maxValue : v );
    }

    /**
     * Property and Setter decorator.
     * Variable keeps between minValue and maxValue inclusive.
     */
    export function clamp( minValue: number, maxValue: number ): any
    {
        if ( minValue > maxValue )
        {
            let tmp = minValue;
            minValue = maxValue;
            maxValue = tmp;
        }
        return setFilter<number>( v => {
            if ( v < minValue ) v = minValue;
            else if ( v > maxValue ) v = maxValue;
            return v;
        } );
    }

    //#endregion

    /**
     * Get raw knockout observable object.
     * @param target    Target object.
     * @param property     Property name which is attaching @observable decorator.
     * @return If found then return KnockoutObservable object, else null.
     */
    export function getObservable<T>( target: any, property: string ): ko.Observable<T>;
    /**
     * Get raw knockout observable object.
     * getObservable( () => this.prop ) equals getObservable( this, 'prop' ).
     * Recommend using this.
     * @param propertyAccess    execute property access. e.g. "() => this.property".
     */
    export function getObservable<T>( propertyAccess: () => T ): ko.Observable<T>;
    export function getObservable<T>(): ko.Observable<T> | null
    {
        if ( typeof arguments[ 0 ] === "function" )
        {
            lastGetKoObservable = null;
            arguments[ 0 ]();
            let res = lastGetKoObservable;
            lastGetKoObservable = null;
            return res;
        }
        else
        {
            let target = arguments[ 0 ];
            let property = arguments[ 1 ];
            return KnockoutDecoratorObjInfo.Get( target ).getObservable<T>( property );
        }
    }

    /**
     * Get row knockout observable array object.
     * @param target    Target object.
     * @param property     Property name which is attaching @observableArray decorator.
     */
    export function getObservableArray<T>( target: any, property: string ): ko.ObservableArray<T>;
    /**
     * Get row knockout observable array object.
     * @param propertyAccess    execute property access. e.g. "() => this.property".
     */
    export function getObservableArray<T>( propertyAccess: () => T[] ): ko.ObservableArray<T>;
    export function getObservableArray<T>(): ko.ObservableArray<T> | null
    {
        if ( typeof arguments[ 0 ] === "function" )
        {
            lastGetKoObservableArray = null;	// reset
            arguments[ 0 ]();
            let res = lastGetKoObservableArray;
            lastGetKoObservable = null;
            return res;
        }
        else
        {
            let target = arguments[ 0 ];
            let property = arguments[ 1 ];
            return KnockoutDecoratorObjInfo.Get( target ).getObservableArray<T>( property );
        }
    }

    /**
     * Get raw knockout computed object.
     * @param target    Target object.
     * @param accessor    Accessor name which is attached the @computed decorator.
     * @return If found then KnockoutComputed object, else null.
     */
    export function getComputed<T>( target: any, accessor: string ): ko.Computed<T>;
    /**
     * Get raw knockout computed object.
     * getComputed( () => this.getter ) equals getComputed( this, 'getter' ).
     * @param getterAccess    execute getter. e.g. "() => this.getter".
     * @return If found then KnockoutComputed object, else null.
     */
    export function getComputed<T>( getterAccess: () => T ): ko.Computed<T>;
    export function getComputed<T>(): ko.Computed<T> | null
    {
        if ( typeof arguments[ 0 ] === "function" )
        {
            lastGetKoComputed = null;	// reset
            arguments[ 0 ]();
            let res = lastGetKoComputed;
            lastGetKoComputed = null;
            return res;
        }
        else
        {
            let target = arguments[ 0 ];
            let accessor = arguments[ 1 ];
            return KnockoutDecoratorObjInfo.Get( target ).getComputed<T>( accessor );
        }

    }

    // #region no export

    /** @private */
    function getComputedDecoratorFactory( options: IComputedOptions | null ): MethodDecorator
    {
        // @ts-ignore
        return ( prototype: Object, accessor: string, descriptor: PropertyDescriptor ) => {
            let getter = descriptor.get;
            if ( !getter )
            {
                throw "@Computed and @pureComputed require getter.";
            }
            let setter = descriptor.set;

            descriptor.get = function () {
                // @ts-ignore
                KnockoutDecoratorObjInfo.Get( this ).makeComputed( accessor, getter, setter, options );
                // @ts-ignore
                return this[ accessor ];
            }
            if ( setter )
            {
                descriptor.set = function ( value ) {
                    // @ts-ignore
                    KnockoutDecoratorObjInfo.Get( this ).makeComputed( accessor, getter, setter, options );
                    // @ts-ignore
                    this[ accessor ] = value;
                }
            }
        }
    }

    let lastGetKoObservable: ko.Observable<any> | null = null;
    let lastGetKoObservableArray: ko.ObservableArray<any> | null = null;
    let lastGetKoComputed: ko.Computed<any> | null = null;

    // Information that class should have.
    class KnockoutDecoratorClassInfo
    {
        public static Get( constructor: Function ): KnockoutDecoratorClassInfo;
        public static Get( prototype: Object ): KnockoutDecoratorClassInfo;
        public static Get( target: any ): KnockoutDecoratorClassInfo
        {
            target = ( typeof target == "function" ) ? target.prototype : target;
            if ( !target[ KnockoutDecoratorClassInfo.Key ] )
            {
                target[ KnockoutDecoratorClassInfo.Key ] = new this();
            }
            return target[ KnockoutDecoratorClassInfo.Key ];
        }

        public pushIgnoreProperty( property: string ): void
        {
            if ( !this.ignoreProperties ) this.ignoreProperties = [];
            this.ignoreProperties.push( property );
        }

        public isIgnoreProperty( property: string ): boolean
        {
            return this.ignoreProperties != undefined &&
                this.ignoreProperties.indexOf( property ) != -1;
        }

        public pushKoExtend( name: string, extendOptions: any ): void
        {
            if ( !this.extendsHash ) this.extendsHash = {};
            if ( !this.extendsHash[ name ] ) this.extendsHash[ name ] = [];
            this.extendsHash[ name ].push( extendOptions );
        }

        public applyKoExtend( target: string, o: ko.Subscribable<any> ): void
        {
            if ( !this.extendsHash ) return;
            let extendArr = this.extendsHash[ target ];
            if ( !extendArr ) return;
            let len = extendArr.length;
            for ( let i = 0; i < len; ++i )
            {
                o.extend( extendArr[ i ] );
            }
        }

        public pushSetFilter( property: string, filterFunc: ( v: any ) => any )
        {
            if ( !this.setFiltersHash ) this.setFiltersHash = {};
            let filters = this.setFiltersHash[ property ]
            if ( !filters )
            {
                filters = this.setFiltersHash[ property ] = [];
            }
            filters.push( filterFunc );
        }

        public getSetter( target: string, o: ko.Subscribable<any> ): any
        {
            if ( !this.setFiltersHash ) return o;
            let filters = this.setFiltersHash[ target ];
            if ( !filters ) return o;
            let len = filters.length;
            return ( v: any ) => {
                for ( let i = 0; i < len; ++i )
                {
                    v = filters[ i ]( v );
                }
                o( v );
            }
        }

        public static readonly Key = "__vtKnockoutDecoratorClassInfo__";
        private ignoreProperties: string[] | undefined;
        private extendsHash: { [ property: string ]: any[] } | undefined;
        private setFiltersHash: { [ property: string ]: ( ( v: any ) => any )[] } | undefined;

        private constructor()
        {
        }
    }

    // Information that instanced object should have.
    class KnockoutDecoratorObjInfo
    {
        public static Get( target: any ): KnockoutDecoratorObjInfo
        {
            if ( !target[ KnockoutDecoratorObjInfo.Key ] )
            {
                target[ KnockoutDecoratorObjInfo.Key ] = new this( target );
            }
            return target[ KnockoutDecoratorObjInfo.Key ];
        }

        public makeObservable( property: string ): void
        {
            let o = ko.observable<any>();
            this.koObservableHash[ property ] = o;
            let prototype = Object.getPrototypeOf( this.target )
            let classInfo = KnockoutDecoratorClassInfo.Get( prototype );
            classInfo.applyKoExtend( property, o );
            KnockoutDecoratorClassInfo.Get( prototype )
            Object.defineProperty( this.target, property, {
                get: () => {
                    lastGetKoObservable = o;
                    return o();
                },
                set: classInfo.getSetter( property, o )
            } );
        }

        public makeObservableArray( property: string ): void
        {
            function replaceFunction( src: any[], o: ko.ObservableArray<any> )
            {
                let originals: { [ fn: string ]: Function } = {};
                [ "splice", "pop", "push", "shift", "unshift", "reverse", "sort" ].forEach( fnName => {
                    originals[ fnName ] = ( <any>src )[ fnName ];
                    let mimicry = function () {
                        // restore the original function for call it inside ObservableArray.
                        ( <any>src )[ fnName ] = originals[ fnName ];

                        // call ObservableArray function
                        // @ts-ignore
                        let res = ( o[ fnName ] as Function ).apply( o, arguments );

                        // rewrite the original function again.
                        ( <any>src )[ fnName ] = mimicry;

                        return res;
                    };

                    // rewrite the original function
                    ( <any>src )[ fnName ] = mimicry;
                } );
            }

            function mergeFunction( src: any[], o: ko.ObservableArray<any> )
            {
                [ "replace", "remove", "removeAll", "destroy", "destroyAll" ].forEach( fnName => {
                    ( <any>src )[ fnName ] = function () {
                        // @ts-ignore
                        return ( o[ fnName ] as Function ).apply( o, arguments );
                    };
                } );
            }

            let o = ko.observableArray<any>();
            this.koObservableArrayHash[ property ] = o;
            let prototype = Object.getPrototypeOf( this.target )
            let classInfo = KnockoutDecoratorClassInfo.Get( prototype );
            classInfo.applyKoExtend( property, o );
            KnockoutDecoratorClassInfo.Get( prototype )

            Object.defineProperty( this.target, property, {
                get: () => {
                    lastGetKoObservableArray = o;
                    return o();
                },
                set: function ( arrayValue: any[] ) {
                    if ( arrayValue )
                    {
                        replaceFunction( arrayValue, o );
                        mergeFunction( arrayValue, o );
                    }
                    classInfo.getSetter( property, o )( arrayValue );
                }
            } );

        }

        public makeComputed( accessor: string, getter: () => any, setter: ( v: any ) => void, options: IComputedOptions ): void
        {
            let computedOptions: ko.ComputedOptions<any> = {
                read: getter,
                write: setter,
                owner: this.target
            };
            if ( options )
            {
                for ( let key in options )
                {
                    ( <any>computedOptions )[ key ] = ( <any>options )[ key ];
                }
            }
            let c = ko.computed( computedOptions );
            // @ts-ignore
            this.koComputedHash[ accessor ] = c;
            let prototype = Object.getPrototypeOf( this.target )
            let classInfo = KnockoutDecoratorClassInfo.Get( prototype );
            classInfo.applyKoExtend( accessor, c );
            Object.defineProperty( this.target, accessor, {
                get: () => {
                    // @ts-ignore
                    lastGetKoComputed = c;
                    return c();
                },
                set: setter != null ? classInfo.getSetter( accessor, c ) : undefined
            } );
        }

        public getObservable<T>( property: string ): ko.Observable<T>
        {
            return this.koObservableHash[ property ];
        }

        public getObservableArray<T>( property: string ): ko.ObservableArray<T>
        {
            return this.koObservableArrayHash[ property ];
        }

        public getComputed<T>( accessor: string ): ko.Computed<T>
        {
            return this.koComputedHash[ accessor ];
        }

        public static readonly Key = "__vtKnockoutDecoratorObjInfo__";
        private readonly target: any;
        private koObservableHash: { [ property: string ]: ko.Observable<any> } = {};
        private koObservableArrayHash: { [ property: string ]: ko.ObservableArray<any> } = {};
        private koComputedHash: { [ accessor: string ]: ko.Computed<any> } = {};

        private constructor( target: any )
        {
            this.target = target;
        }
    }

    // #endregion

    // export default module
    /*if ( typeof exports !== typeof undefined )
    {
        module.exports = KnockoutDecorator;
        module.exports[ "default" ] = KnockoutDecorator;
    }*/
}

export default KnockoutDecorator;
