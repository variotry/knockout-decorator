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
	 * by converting a array property which is attached @observableArray to this.
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
	 * Just attach to a property as decorator.
	 * If you change a property value, a view will also change. And vice versa.
	 */
	export function observable( _class: any, propertyName: string ): void
	{
		function registerProperty( instancedObj: any ): void
		{
			let o = ko.observable();
			
			setObservableObjet( instancedObj, propertyName, o );
			assignExtendForInstancedObj( _class, instancedObj, propertyName );
			Object.defineProperty( instancedObj, propertyName, {
				get: o,
				set: o
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
	 * Just attach to a array property as decorator.
	 * If you set a property to a new array data, a view will also change.
	 * If you call a Array function such as push or pop, a view will also change.
	 */
	export function observableArray( _class: any, propertyName: string ): void
	{
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
					o( arrayValue );
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
	 * Just attach to a property accessor as decorator.
	 * If a observable property value in the getter is changed, it will be called.
	 * If you define also a setter, you can treat as writable computed.
	 */
	export function computed( _class: any, propertyName: string, descriptor: PropertyDescriptor ): void
	/**
	 * Just attach to a property accessor as decorator.
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
	 * Just attach to a property accessor as decorator.
	 */
	export function pureComputed( _class: any, propertyName: string, descriptor: PropertyDescriptor ): void
	{
		getComputedDecoratorFactory( { pure: true } )( _class, propertyName, descriptor );
	}

	/**
	 * Just attach to a property or property accessor.
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

	/**
	 * Just attach to a number type property.
	 * This convert to number type if set a value other than number type such as value is changed via input element on a browser.
	 * If the converted value is NaN, it treat as zero.
	 * @extend require attaching observable decorator.
	 */
	export function asNumber( _class: any, propertyName: string ): void
	{
		registerSubscribe( _class, propertyName, function( newValue : any )
		{
			if ( typeof newValue !== "number" )
			{
				let o = getObservableObject( this, propertyName );
				if ( !o )
				{
					throw  "@asNumber require @observable";
				}
				let v = parseFloat( newValue );
				o( isNaN( v ) ? 0 : v );
			}
		});
	}

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
					set: setter ? c : undefined
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
	const storeSubscribeKey = "__vtKnockoutSubscribes__";

	/** @private */
	function registerSubscribe( _class: any, propertyName: string, callback: ( newValue: any ) => void )
	{
		if ( !_class[storeSubscribeKey] ) _class[storeSubscribeKey] = {};
		if ( !_class[storeSubscribeKey][propertyName] ) _class[storeSubscribeKey][propertyName] = [];
		_class[storeSubscribeKey][propertyName].push( callback );
	}

	/** @private */
	function getSubscribers( _class: any, propertyName: string ): ( ( newValue: any ) => void )[]
	{
		if ( !_class[storeSubscribeKey] ) return null;
		return _class[storeSubscribeKey][propertyName];
	}


	/** @private */
	function assignExtendForInstancedObj( _class:any, instancedObj: any, propertyName ): void
	{
		var o = getObservableObject( instancedObj, propertyName );
		var ext = getExtend( _class, propertyName );
		if ( ext ) o.extend( ext );
		var subscribers = getSubscribers( _class, propertyName );
		if ( subscribers )
		{
			for ( let i = 0; i < subscribers.length; ++i )
			{
				o.subscribe( subscribers[i], instancedObj );
			}
		}
	}

	// #endregion
}
