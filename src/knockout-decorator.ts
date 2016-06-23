/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

namespace variotry.KnockoutDecorator
{
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
	 * Just attach to a property as decorator.
	 * If you change a property value, a view will also change. And vice versa.
	 */
	export function observable( target:any, propertyKey:string ) : void
	{
		var v = target[propertyKey];
		var o = ko.observable();
		pushObservable( target, propertyKey, o );
		Object.defineProperty( target, propertyKey, {
			get: o,
			set: o
		});
	}

	/**
	 * Just attach to a array property as decorator.
	 * If you set a property to a new array data, a view will also change.
	 * If you call a Array function such as push or pop, a view will also change.
	 */
	export function observableArray( target: any, propertyKey: string ): void
	{
		var o = ko.observableArray();
		function replaceFunction( src: any[] )
		{
			var originals: { [fn: string]: Function } = {};
			[ "splice", "pop", "push", "shift", "unshift", "reverse", "sort" ].forEach( fnName =>
			{
				originals[fnName] = src[fnName];
				var mimicry = function ()
				{
					// restore the original function for call it inside ObservableArray.
					src[fnName] = originals[fnName];

					// call ObservableArray function
					var res = ( o[fnName] as Function ).apply( o, arguments );

					// rewrite the original function again.
					src[fnName] = mimicry;

					return res;
				};

				// rewrite the original function
				src[fnName] = mimicry;
			});
			
			var nums: number[] = [];
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

		pushObservable( target, propertyKey, o );
		Object.defineProperty( target, propertyKey, {
			get: o,
			set: newArray =>
			{
				if ( newArray && Array.isArray( newArray ) === false )
				{					
					throw target["constructor"].name + "." + propertyKey + " attached the observableArray decorator must be array.";
				}
				replaceFunction( newArray );
				mergeFunction( newArray );
				o( newArray );
			}
		});
	}


	/**
	 * Just attach to a property accessor as decorator.
	 * When changed a observable property value inside a getter, it will be called.
	 * If you define also a setter, you can use it as writable computed.
	 */
	export function computed( target: any, propertyKey: string, descriptor: PropertyDescriptor ): MethodDecorator;
	/**
	 * Just attach to a property accessor as decorator.
	 * @param extend	KnockoutComputed.extend options Such as { throttle:500 }.
	 */
	export function computed( extend: { [key: string]: any }): MethodDecorator;
	export function computed( extend?: { [key: string]: any }): MethodDecorator
	{
		return ( target: any, propertyKey: string, descriptor: PropertyDescriptor ) =>
		{
			var getter = descriptor.get;
			var setter = descriptor.set;

			var c = ko.computed( {
				read: getter ? () => getter.call( target ) : null,
				write: setter ? ( v ) => setter.call( target, v ) : null
			});

			if ( extend )
			{
				c.extend( extend );
			}

			pushObservable( target, propertyKey, c );

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

	/**
	 * Get raw knockout observable object.
	 * @param target		Instance object.
	 * @param propertyKey	Name of a property which have the @observable.
	 * @return If found then KnockoutObservable object, else null.
	 */
	export function getObservable<T>( target: any, propertyKey ): KnockoutObservable<T>
	{
		var o = getObservableObject( target, propertyKey );
		return ko.isObservable( o ) ? o : null;
	}

	/**
	 * Get raw knockout computed object.
	 * @param target		Instance object.
	 * @param propertyKey	Name of a property which have the @computed.
	 * @return If found then KnockoutComputed object, else null.
	 */
	export function getComputed<T>( target: any, propertyKey ): KnockoutComputed<T>
	{
		var c = getObservableObject( target, propertyKey );
		return ko.isComputed( c ) ? c : null;
	}

	// #region no export

	/** @private */
	const storeObservableKey = "__vtKnockoutObservables__";

	/** @private */
	function pushObservable( target: any, propertyKey: string, o: KnockoutObservable<any> | KnockoutComputed<any> )
	{
		if ( !target[storeObservableKey] ) target[storeObservableKey] = [];

		var store = target[storeObservableKey];
		store[propertyKey] = o;
	}

	/** @private */
	function getObservableObject( target: any, propertyKey: string ): any
	{
		var store = target[storeObservableKey];
		if ( !store ) return null;
		return store[propertyKey];
	}
	// #endregion
}
