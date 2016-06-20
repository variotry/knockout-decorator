/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

namespace variotry.KnockoutDecorator
{
	var storeObservableKey = "__vtKnockoutObservables__";
	export function observable( target:any, propertyKey:string )
	{
		var v = target[propertyKey];
		var o = ko.observable( v );
		Object.defineProperty( target, propertyKey, {
			get: () => o(),
			set: ( v ) => o( v )
		});
		var d = Object.getOwnPropertyDescriptor( target, propertyKey );
	}
	export function observableArray()
	{
	}
	export function computed()
	{
	}
}
