/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

namespace variotry.KnockoutDecorator
{
	

	export function observable( target:any, propertyKey:string ) : void
	{
		var v = target[propertyKey];
		var o = ko.observable( v );
		pushObservable( target, propertyKey, o );
		Object.defineProperty( target, propertyKey, {
			get: o,
			set: o
		});
	}


	// implement later
	/*export function observableArray( target: any, propertyKey: string ): void
	{
		var v = target[propertyKey];
		var o = ko.observableArray();
	}*/

	export function computed(): MethodDecorator
	export function computed( extend: { [key: string]: any }): MethodDecorator;
	export function computed( extend?: { [key: string]: any }): MethodDecorator
	{
		return ( target: any, propertyKey: string, descriptor: PropertyDescriptor ) =>
		{
			var getter = descriptor.get;
			var setter = descriptor.set;

			var c = ko.computed( {
				read: () => getter.call( target ),
				write: setter ? ( v ) => setter.call( target, v ) : null
			});

			if ( extend )
			{
				c.extend( extend );
			}

			pushObservable( target, propertyKey, c );

			descriptor.get = c;
			if ( setter )
			{
				descriptor.set = c;
			}
		}
	}

	export function getObservable<T>( target: any, propertyKey ): KnockoutObservable<T>
	{
		var o = getObservableObject( target, propertyKey );
		return ko.isObservable( o ) ? o : null;
	}

	export function getComputed<T>( target: any, propertyKey ): KnockoutComputed<T>
	{
		var c = getObservableObject( target, propertyKey );
		return ko.isComputed( c ) ? c : null;
	}

	// #region no export
	const storeObservableKey = "__vtKnockoutObservables__";
	function pushObservable( target: any, propertyKey: string, o: KnockoutObservable<any> | KnockoutComputed<any> )
	{
		if ( !target[storeObservableKey] ) target[storeObservableKey] = [];

		var store = target[storeObservableKey];
		store[propertyKey] = o;
	}

	function getObservableObject( target: any, propertyKey: string ): any
	{
		var store = target[storeObservableKey];
		if ( !store ) return null;
		return store[propertyKey];
	}
	// #endregion
}
