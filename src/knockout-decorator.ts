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
	export function computed( target: any, propertyName: string, descriptor: PropertyDescriptor ): void;
	/**
	 * Just attach to a property accessor as decorator.
	 * @param extend	KnockoutComputed.extend options Such as { throttle:500 }.
	 */
	export function computed( extend: { [key: string]: any }): MethodDecorator;
	export function computed(): any
	{
		let extend: { [key: string]: any; };
		if ( arguments.length === 1 )
		{
			extend = arguments[0];
		}

		// decorator factory.
		function factory( target: any, propertyName: string, descriptor: PropertyDescriptor ): void
		{
			let getter = descriptor.get;
			let setter = descriptor.set;

			let c = ko.computed( {
				read: getter ? () => getter.call( target ) : null,
				write: setter ? ( v ) => setter.call( target, v ) : null
			});

			if ( extend )
			{
				c.extend( extend );
			}

			pushObservable( target, propertyName, c );

			if ( getter )
			{
				descriptor.get = c;
			}
			if ( setter )
			{
				descriptor.set = c;
			}
		};

		if ( arguments.length === 1 )
		{
			// return decorator factory if @computed is attached with argument.
			return factory;
		}

		// Decorator factory aren't executed if @computed is attached without argument,
		// thus I execute it and don't return it.
		factory.apply( this, arguments );
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
		console.log( "push,", propertyName );
		if ( !target[storeObservableKey] ) target[storeObservableKey] = [];
		target[storeObservableKey][propertyName] = o;
	}

	/** @private */
	function getObservableObject( target: any, propertyName: string ): any
	{
		let store = target[storeObservableKey];
		if ( !store ) return null;
		return store[propertyName];
	}
	// #endregion
}
