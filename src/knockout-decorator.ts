/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

namespace variotry.KnockoutDecorator
{
	// #region declare interfaces.
	/**
	 * You can easily access KnockoubObservableArray functions via intellisense
	 * by converting a array property which is attaching @observableArray.
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
	 * @computed argument options.
	 */
	export interface IComputedOptions
	{
		pure?: boolean;
		deferEvaluation?: boolean;
		disposeWhen?(): boolean;
		disposeWhenNodeIsRemoved?: Node;
	}

	// #endregion

	/**
	 * Argument of @track decorator.
	 */
	export interface ITrackOptions
	{
		/**
		 * Convert to pure computed if true or undefined, non pure computed otherwise.
		 */
		pureComputed?: boolean,

		/**
		 * Set name of method that you want to execute after a constructor finish.
		 * You can get raw observable objects using getObservable<T>() in the method.
		 * Attension; when you use `@track` decorator, you can't get raw observable in a constructor.
		 */
		initializeMethod?: string
	}

	/**
	 * Attach to a class as decorator.
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
	export function track( constructor: Function );
	/**
	 * Attach to a class as decorator.
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
	export function track( options: ITrackOptions );
	export function track( arg:any ) : any
	{
		let options: ITrackOptions;
		if ( typeof arg === "function" )
		{
			options = {
				pureComputed: true,
				initializeMethod: null
			};
		}
		else
		{
			options = arg;
			let defaults = {
				pureComputed: true,
				initializeMethod: null
			};
			if ( !options )
			{
				options = defaults;
			}
			else
			{
				for ( let key in defaults )
				{
					if ( options[key] === undefined )
					{
						options[key] = defaults[key];
					}
				}
			}
			console.log( options );
		}

		function classFactory( constructor: Function )
		{
			let original = constructor;
			function isIgnore( properyName: string )
			{
				if ( !constructor[ignoresKey] ) return false;
				return constructor[ignoresKey].indexOf( properyName ) >= 0;
			}

			function trackConstructor( args )
			{
				let c: any = function ()
				{
					return original.apply( this, args );
				}
				c.prototype = original.prototype;

				let functions = Object.keys( c.prototype );
				let computedAccessors = [];
				functions.forEach( f =>
				{
					if ( isRegisteredObserbable( c.prototype, f ) )
					{
						computedAccessors.push( f );
						return;
					}
					if ( isIgnore( f ) ) return;
					let d = Object.getOwnPropertyDescriptor( c.prototype, f );
					if ( !d || !d.get ) return;
					let factory = getComputedDecoratorFactory( {
						pure: options.pureComputed
					} );
					factory( c.prototype, f, d );
					Object.defineProperty( c.prototype, f, d );
					computedAccessors.push( f );
				});

				let o = new c();
				let properties = Object.keys( o );

				properties.forEach( p =>
				{
					if ( isRegisteredObserbable( c.prototype, p ) ) return;
					if ( p.match( /^__vtKnockout/ ) ) return;
					if ( isIgnore( p ) ) return;

					let v = o[p];
					delete o[p];
					if ( Array.isArray( v ) )
					{
						observableArray( c.prototype, p );
					}
					else
					{
						observable( c.prototype, p );
					}
					o[p] = v;
				});

				computedAccessors.forEach( a => o[a] );
				computedAccessors = null;
				functions = null;
				properties = null;
				if ( options.initializeMethod && typeof o[options.initializeMethod] === "function" )
				{
					o[options.initializeMethod]();
				}
				return o;
			}
			return trackConstructor;
		}
		
		if ( typeof arg === "function" )
		{
			return classFactory( arg );
		}
		else
		{
			return function ( constructor: Function )
			{
				return classFactory( constructor );
			}
		}
	}

	/** @private */
	const ignoresKey = "__vtKnockoutIgnoresKey__";

	/**
	 * Attach to a property or a accessor as decorator.
	 * This decorator prevents a property or a accessor from converting to observable in @track.
	 */
	export function ignore( _class: any, propertyName: string ): void
	{
		let constructor = _class.constructor;
		if ( !constructor[ignoresKey] ) constructor[ignoresKey] = [];
		constructor[ignoresKey].push( propertyName );
	}

	/**
	 * Attach to a property as decorator.
	 * If you change a property value, a view will also change. And vice versa.
	 */
	export function observable( _class: any, propertyName: string ): void
	{
		if ( isRegisteredObserbable( _class, propertyName ) ) return;
		setregisterObserbable( _class, propertyName );
		function registerProperty( instancedObj: any ): void
		{
			let o = ko.observable();
			setObservableObjet( instancedObj, propertyName, o );
			assignExtendForInstancedObj( _class, instancedObj, propertyName );
			Object.defineProperty( instancedObj, propertyName, {
				get: o,
				set: getSetter( _class, propertyName, o )
			});
		}

		Object.defineProperty( _class, propertyName, {
			get: function (): any
			{
				registerProperty( this );
				return this[propertyName];
			},
			set: function ( value: any ): void
			{
				registerProperty( this );
				this[propertyName] = value;
			}
		});
	}

	/**
	 * Attach to a array property as decorator.
	 * If you set a property to a new array data, a view will also change.
	 * If you call a Array function such as push or pop, a view will also change.
	 */
	export function observableArray( _class: any, propertyName: string ): void
	{
		if ( isRegisteredObserbable( _class, propertyName ) ) return;
		setregisterObserbable( _class, propertyName );
		function replaceFunction( src: any[], o: KnockoutObservableArray<any> )
		{
			let originals: { [fn: string]: Function } = {};
			["splice", "pop", "push", "shift", "unshift", "reverse", "sort"].forEach( fnName =>
			{
				originals[fnName] = src[fnName];
				let mimicry = function ()
				{
					// restore the original function for call it inside ObservableArray.
					src[fnName] = originals[fnName];

					// call ObservableArray function
					let res = ( o[fnName] as Function ).apply( o, arguments );

					// rewrite the original function again.
					src[fnName] = mimicry;

					return res;
				};

				// rewrite the original function
				src[fnName] = mimicry;
			});
		}
		function mergeFunction( src: any[], o: KnockoutObservableArray<any>  )
		{
			["replace", "remove", "removeAll", "destroy", "destroyAll"].forEach( fnName =>
			{
				src[fnName] = function ()
				{
					return ( o[fnName] as Function ).apply( o, arguments );
				};
			});
		}
		function registerProperty( instancedObj: any ): void
		{
			let o = ko.observableArray();
			setObservableObjet( instancedObj, propertyName, o );
			assignExtendForInstancedObj( _class, instancedObj, propertyName );
			Object.defineProperty( instancedObj, propertyName, {
				get: o,
				set: function ( arrayValue: any[] )
				{
					if ( arrayValue )
					{
						replaceFunction( arrayValue, o );
						mergeFunction( arrayValue, o );
					}
					getSetter( _class, propertyName, o )( arrayValue );
				}
			});
		}

		Object.defineProperty( _class, propertyName, {
			get: function (): any[]
			{
				registerProperty( this );
				return this[propertyName];
			},
			set: function ( arrayValue: any ): void
			{
				registerProperty( this );
				this[propertyName] = arrayValue;
			}
		});
	}

	/**
	 * Attach to a accessor as decorator.
	 * If a observable property value in a getter is changed, the getter will be executed.
	 * If you define also a setter, you can handle as writable computed.
	 */
	export function computed( _class: any, propertyName: string, descriptor: PropertyDescriptor ): void
	/**
	 * Attach to a accessor as decorator.
	 * @param options	Knockout computed options.
	 * @see <a href="http://knockoutjs.com/documentation/computed-reference.html" target="_blank">Computed Observable Reference</a>
	 */
	export function computed( options: IComputedOptions ): MethodDecorator;
	export function computed(): any
	{
		if ( arguments.length == 1 )
		{
			return getComputedDecoratorFactory( arguments[0] );
		}
		getComputedDecoratorFactory( null ).apply( this, arguments );
	}

	/**
	 * Attach to a accessor as decorator.
	 */
	export function pureComputed( _class: any, propertyName: string, descriptor: PropertyDescriptor ): void
	{
		getComputedDecoratorFactory( { pure: true } )( _class, propertyName, descriptor );
	}

	/**
	 * Attach to a property or accessor.
	 * @extend require attaching observable decorator.
	 * @param options	Set parameter which define ko.extenders such as rateLimit.
	 */
	export function extend( options: { [key: string]: any }): any// PropertyDecorator | MethodDecorator
	{
		return ( _class: any, propertyName: string, descriptor?: PropertyDescriptor ) =>
		{
			registerExtend( _class, propertyName, options );
		};
	}

	//#region set filter decorators
	/**
	 * Attach to a property or accessor(setter).
	 * When you set a value to a property or a setter, the value will be changed through filters.
	 * If there is more than one filter, filters are executed in the order from bottom to top.
	 * @param filterFunc function that return a processed value.
	 */
	export function setFilter( filterFunc: ( setValue: any ) => any ): any // PropertyDecorator | MethodDecorator
	{
		return ( _class: any, propertyName: string ) =>
		{
			registerSetFilter( _class, propertyName, filterFunc );
		};
	}

	/**
	 * Attach to a number type property or a accessor(setter).
	 * This decorator is a kind of `@setFilter`.
	 * This decorator converts to number type if set a value other than number type such as value is changed via input element on a browser.
	 * If a converted value is NaN, it handles as zero.
	 * @extend require attaching observable decorator.
	 */
	export function asNumber( _class: any, propertyName: string ):void
	{
		registerSetFilter( _class, propertyName, v =>
		{
			if ( !v || typeof v === "number" ) return v;
			v = parseFloat( v );
			return isNaN( v ) ? 0 : v;
		});
	}

	/**
	 * Attach to a number type property or a accessor(setter).
	 * This decorator is a kind of `@setFilter`.
	 * This decorator keeps greater than or equal to minValue.
	 * @extend require attaching observable decorator.
	 */
	export function min( minValue: number ): any // PropertyDecorator | MethodDecorator
	{
		return setFilter( v => v < minValue ? minValue : v );
	}

	/**
	 * Attach to a number type property or a accessor(setter).
	 * This decorator is a kind of `@setFilter`.
	 * This decorator keeps less than or equal to maxValue.
	 * @extend require attaching observable decorator.
	 */
	export function max( maxValue: number ): any // PropertyDecorator | MethodDecorator
	{
		return setFilter( v => v > maxValue ? maxValue : v );
	}

	/**
	 * Attach to a number type property or a accessor(setter).
	 * This decorator is a kind of `@setFilter`.
	 * This decorator keeps between minValue and maxValue inclusive.
	 * @extend require attaching observable decorator.
	 */
	export function clamp( minValue:number, maxValue: number ): any // PropertyDecorator | MethodDecorator
	{
		if ( minValue > maxValue )
		{
			let tmp = minValue;
			minValue = maxValue;
			maxValue = tmp;
		}
		return setFilter( v =>
		{
			if ( v < minValue ) v = minValue;
			else if ( v > maxValue ) v = maxValue;
			return v;
		});
	}

	//#endregion

	/**
	 * Get raw knockout observable object.
	 * @param instancedObj	Instanced object.
	 * @param propertyName		Name of a property which is attached the @observable.
	 * @return If found then KnockoutObservable object, else null.
	 */
	export function getObservable<T>( instancedObj: any, propertyName: string ): KnockoutObservable<T>
	{
		let o = getObservableObject( instancedObj, propertyName );
		return ( ko.isObservable( o ) && o.indexOf === undefined ) ? o : null;
	}

	/**
	 * Get row knockout observable array object.
	 * @param instancedObj	Instanced object.
	 * @param propertyName		Name of a property which is attached the @observableArray.
	 */
	export function getObservableArray<T>( instancedObj: any, propertyName: string ): KnockoutObservableArray<T>
	{
		let o = getObservableObject( instancedObj, propertyName );
		return ( ko.isObservable( o ) && o.indexOf !== undefined ) ? o : null;
	}

	/**
	 * Get raw knockout computed object.
	 * @param instancedObj	Instanced object.
	 * @param propertyName		Name of a property which is attached the @computed.
	 * @return If found then KnockoutComputed object, else null.
	 */
	export function getComputed<T>( instancedObj: any, propertyName: string ): KnockoutComputed<T>
	{
		let c = getObservableObject( instancedObj, propertyName );
		return ko.isComputed( c ) ? c : null;
	}

	// #region no export

	/** @private */
	const storeObservableKey = "__vtKnockoutObservables__";

	/** @private */
	function setObservableObjet( instancedObj: any, propertyName: string, o: KnockoutObservable<any> | KnockoutObservableArray<any> | KnockoutComputed<any> )
	{
		if ( !instancedObj[storeObservableKey] ) instancedObj[storeObservableKey] = {};
		instancedObj[storeObservableKey][propertyName] = o;
	}

	/** @private */
	function getObservableObject( instancedObj: any, propertyName: string ): any
	{
		let store = instancedObj[storeObservableKey];
		if ( !store ) return null;
		return store[propertyName];
	}


	/** @private */
	function getComputedDecoratorFactory( options: IComputedOptions ): MethodDecorator
	{
		return ( _class: Object, propertyName: string, descriptor: PropertyDescriptor ) =>
		{
			if ( isRegisteredObserbable( _class, propertyName ) ) return;
			setregisterObserbable( _class, propertyName );

			let getter = descriptor.get;
			if ( !getter )
			{
				throw "@Computed and @pureComputed require getter.";
			}
			let setter = descriptor.set;

			function registerProperty( instancedObj: any ): void
			{
				let computedOptions: KnockoutComputedDefine<any> = {
					read: getter,
					write: setter,
					owner: instancedObj
				};
				if ( options )
				{
					for ( let key in options )
					{
						if ( typeof options[key] === "function" )
						{
							let fn = options[key];
							options[key] = function ()
							{
								fn.apply( instancedObj, arguments );
							}
						}
						computedOptions[key] = options[key];
					}
				}
				let c = ko.computed( computedOptions );
				setObservableObjet( instancedObj, propertyName, c );
				assignExtendForInstancedObj( _class, instancedObj, propertyName );

				Object.defineProperty( instancedObj, propertyName, {
					get: c,
					set: setter ? getSetter( _class, propertyName, c ) : undefined
				} );

			}

			descriptor.get = function()
			{
				registerProperty( this );
				return this[propertyName];
			}
			if ( setter )
			{
				descriptor.set = function ( value )
				{
					registerProperty( this );
					this[propertyName] = value;
				}
			}
		}
	}
	/** @private */
	const registerObjserbablesKey = "__vtKnockoutRegisterObserbables__";

	/** @private */
	function isRegisteredObserbable( _class: any, propertyName: string ): boolean
	{
		return _class[registerObjserbablesKey] && _class[registerObjserbablesKey].indexOf( propertyName ) >= 0
	}

	/** @private */
	function setregisterObserbable( _class: any, propertyName: string ): void
	{
		if ( !_class[registerObjserbablesKey] )
		{
			_class[registerObjserbablesKey] = [];
		}
		_class[registerObjserbablesKey].push( propertyName );
	}

	/** @private */
	const storeExtendKey = "__vtKnockoutExtends__";

	/** @private */
	function registerExtend( _class: any, propertyName: string, extendOptions: any )
	{
		if ( !_class[storeExtendKey] ) _class[storeExtendKey] = {};
		_class[storeExtendKey][propertyName] = extendOptions;
	}

	/** @private */
	function getExtend( _class: any, propertyName: string ): any
	{
		let store = _class[storeExtendKey];
		if ( !store ) return null;
		return store[propertyName];
	}

	/** @private */
	const storeSetFilterKey = "__vtKnockoutSetFilters__";

	/** @private */
	function registerSetFilter( _class: any, propertyName: string, filterFunc: ( setValue: any ) => any ): void
	{
		if ( !_class[storeSetFilterKey] ) _class[storeSetFilterKey] = {};
		if ( !_class[storeSetFilterKey][propertyName] ) _class[storeSetFilterKey][propertyName] = [];
		_class[storeSetFilterKey][propertyName].push( filterFunc );
	}

	/** @private */
	function getSetter( _class: any, propertyName: string, observable: KnockoutObservable<any> ): any
	{
		if ( !_class[storeSetFilterKey] ) return observable;
		let filters = _class[storeSetFilterKey][propertyName];
		if ( !filters ) return observable;
		let len = filters.length;
		return v =>
		{
			let original = v;
			for ( let i = 0; i < len; ++i )
			{
				v = filters[i]( v );
			}
			observable( v );
		}
	}

	/** @private */
	function assignExtendForInstancedObj( _class:any, instancedObj: any, propertyName: string ): void
	{
		let o = getObservableObject( instancedObj, propertyName );
		let ext = getExtend( _class, propertyName );
		if ( ext ) o.extend( ext );
	}
	
	// #endregion
}
