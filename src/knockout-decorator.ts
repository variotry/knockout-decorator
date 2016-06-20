/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

namespace variotry.KnockoutDecorator
{
	var storeObservableKey = "__vtKnockoutObservables__";
	function pushObservable( target: any, propertyKey: string, o: KnockoutObservable<any> | KnockoutComputed<any> )
	{
		if ( !target[storeObservableKey] ) target[storeObservableKey] = [];

		var store = target[storeObservableKey];
		store[propertyKey] = o;
	}

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

	export function observableArray( target: any, propertyKey: string ): void
	{
		/*var v = target[propertyKey];
		var o = ko.observableArray();*/
	}

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
}
