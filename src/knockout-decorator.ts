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
		var o = ko.observable();
		pushObservable( target, propertyKey, o );
		Object.defineProperty( target, propertyKey, {
			get: o,
			set: o
		});
	}


	export function observableArray( target: any, propertyKey: string ): void
	{
		function replaceFunction( src: any[] )
		{
			var originals: { [fn: string]: Function } = {};
			[ "splice", "pop", "push", "shift", "unshift", "reverse", "sort" ].forEach( fnName =>
			{
				originals[fnName] = src[fnName];
				var mimicry = function ()
				{
					//console.log( "call mimicry,", fnName );

					// restore the original function for call it inside ObservableArray.
					src[fnName] = originals[fnName];

					// call ObservableArray function
					var res = ( o[fnName] as any ).apply( o, arguments );

					// rewrite the original function again.
					src[fnName] = mimicry;

					return res;
				};

				// rewrite the original function
				src[fnName] = mimicry;
			});
			
			var nums: number[] = [];
		}


		var v = target[propertyKey];
		//console.log( "v is,", v, target );
		var o = ko.observableArray( v );
		pushObservable( target, propertyKey, o );
		Object.defineProperty( target, propertyKey, {
			get: o,
			set: newArray =>
			{
				replaceFunction( newArray );
				//console.log( "new array is", newArray );
				o( newArray );
			}
		});
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
