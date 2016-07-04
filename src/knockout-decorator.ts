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
	export function observable( target: any, propertyName: string ): void
	{
		let o = ko.observable();
		pushObservable( target, propertyName, o );
		Object.defineProperty( target, propertyName, {
			get: o,
			set: o
		});
	}

	/**
	 * Just attach to a array property as decorator.
	 * If you set a property to a new array data, a view will also change.
	 * If you call a Array function such as push or pop, a view will also change.
	 */
	export function observableArray( target: any, propertyName: string ): void
	{
		let o = ko.observableArray();
		function replaceFunction( src: any[] )
		{
			let originals: { [fn: string]: Function } = {};
			[ "splice", "pop", "push", "shift", "unshift", "reverse", "sort" ].forEach( fnName =>
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
		function mergeFunction( src: any[] )
		{
			["replace", "remove", "removeAll", "destroy", "destroyAll"].forEach( fnName =>
			{
				src[fnName] = function ()
				{
					return ( o[fnName] as Function ).apply( o, arguments );
				};
			});
		}

		pushObservable( target, propertyName, o );
		Object.defineProperty( target, propertyName, {
			get: o,
			set: newArray =>
			{
				if ( newArray && Array.isArray( newArray ) === false )
				{
					throw target["constructor"].name + "." + propertyName + " attached the observableArray decorator must be array.";
				}
				replaceFunction( newArray );
				mergeFunction( newArray );
				o( newArray );
			}
		});
	}


	/**
	 * Just attach to a property accessor as decorator.
	 * If a observable property value in the getter is changed, it will be called.
	 * If you define also a setter, you can treat as writable computed.
	 */
	export function computed( target: any, propertyName: string, descriptor: PropertyDescriptor ): void
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
	export function pureComputed( target: any, propertyName: string, descriptor: PropertyDescriptor ): void
	{
		getComputedDecoratorFactory( { pure: true } )( target, propertyName, descriptor );
	}

	/**
	 * Just attach to a property or property accessor.
	 * @extend require attaching observable decorator.
	 * @param options	Set parameter which define ko.extenders such as rateLimit.
	 */
	export function extend( options: { [key: string]: any }): any// PropertyDecorator | MethodDecorator
	{
		return ( target: any, propertyName: string, descriptor?: PropertyDescriptor ) =>
		{
			var o = getObservableObject( target, propertyName );
			if ( !o )
			{
				// I try get observable object again
				// to get it if @extend is attached after observable decorator.
				setTimeout(() =>
				{
					o = getObservableObject( target, propertyName );
					if ( o )
					{
						o.extend( options );
					}
					else
					{
						var msg = "Can't get observable object from '";
						msg += target["constructor"].name + "." + propertyName + "'.\n";
						msg += "In order to use @extend need attach observable decorator.";
						console.error( msg );
					}
				});
				return;
			}
			o.extend( options );
		};
	}

	/**
	 * Get raw knockout observable object.
	 * @param target	Instance object.
	 * @param propertyName		Name of a property which is attached the @observable.
	 * @return If found then KnockoutObservable object, else null.
	 */
	export function getObservable<T>( target: any, propertyName: string ): KnockoutObservable<T>
	{
		let o = getObservableObject( target, propertyName );
		return ( ko.isObservable( o ) && o.indexOf === undefined ) ? o : null;
	}

	/**
	 * Get row knockout observable array object.
	 * @param target	Instance object.
	 * @param propertyName		Name of a property which is attached the @observableArray.
	 */
	export function getObservableArray<T>( target: any, propertyName: string ): KnockoutObservableArray<T>
	{
		let o = getObservableObject( target, propertyName );
		return ( ko.isObservable( o ) && o.indexOf !== undefined ) ? o : null;
	}

	/**
	 * Get raw knockout computed object.
	 * @param target	Instance object.
	 * @param propertyName		Name of a property which is attached the @computed.
	 * @return If found then KnockoutComputed object, else null.
	 */
	export function getComputed<T>( target: any, propertyName: string ): KnockoutComputed<T>
	{
		let c = getObservableObject( target, propertyName );
		return ko.isComputed( c ) ? c : null;
	}

	// #region no export

	/** @private */
	const storeObservableKey = "__vtKnockoutObservables__";

	/** @private */
	function pushObservable( target: any, propertyName: string, o: KnockoutObservable<any> | KnockoutObservableArray<any> | KnockoutComputed<any> )
	{
		if ( !target[storeObservableKey] ) target[storeObservableKey] = {};
		target[storeObservableKey][propertyName] = o;
	}

	/** @private */
	function getObservableObject( target: any, propertyName: string ): any
	{
		let store = target[storeObservableKey];
		if ( !store ) return null;
		return store[propertyName];
	}


	/** @private */
	function getComputedDecoratorFactory( options: IComputedOptions ): MethodDecorator
	{
		return ( target: Object, propertyName: string, descriptor: PropertyDescriptor ) =>
		{
			let getter = descriptor.get;
			if ( !getter )
			{
				throw "@Computed and @pureComputed require getter.";
			}
			let setter = descriptor.set;

			let computedOptions: KnockoutComputedDefine<any> = {
				read: getter,
				write: setter,
				owner: target
			};
			if ( options )
			{
				for ( var key in options )
				{
					if ( typeof options[key] === "function" )
					{
						var fn = options[key];
						options[key] = function ()
						{
							fn.apply( target, arguments );
						}
					}
					computedOptions[key] = options[key];
				}
			}
			let c = ko.computed( computedOptions );

			pushObservable( target, propertyName, c );

			if ( getter )
			{
				descriptor.get = c;
			}
			if ( setter )
			{
				descriptor.set = c;
			}
		}
		
	}

	// #endregion
}
