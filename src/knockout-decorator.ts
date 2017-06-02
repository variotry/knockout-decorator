/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */


module KnockoutDecorator
{
	// #region declare interfaces.
	/**
	 * You can easily access KnockoubObservableArray functions via intellisense
	 * by casting a array property which is attaching @observableArray.
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
		disposeWhenNodeIsRemoved?: Node;
		disposeWhen?(): boolean;
		deferEvaluation?: boolean;
		pure?: boolean;
	}

	// #endregion

	/**
	 * Argument of @track decorator.
	 */
	export interface ITrackOptions
	{
		/**
		 * Make accessors pure koComputed if true or undefined, else non pure koComputed.
		 */
		pureComputed?: boolean,

		/**
		 * Deprecated. Use init instead.
		 * If value set, perform obj[initializeMethod]() immediate after executed constructor.
		 */
		initializeMethod?: string,

		/**
		 * If value set, perform obj[init]() immediate after executed constructor.
		 * In order to use raw koObservable if you use track decorator,
		 * it is necessary to be not inside constructor but after executed constructor.
		 */
		init?: string;

		[key: string]: any
	}
	/**
	 * Class decorator.
	 * Make all properties/accessors to koObservable/koComputed.
	 * Points to consider.
	 * 1. Properties that are not initialized at declare or in constructor don't become koObservable.
	 * 2. In order to recognize a array property as koObservableArray, it is necessary to set a array value first(e.g set [] ).
	 * 3. Accessors become pure koComputed.
	 * 4. A property/accessor with `@ignore` don't become koObservable.
	 * 5. In order to use raw koObservable, it is necessary to be not inside constructor but after executed constructor.
	 */
	export function track( constructor: Function ): any;
	/**
	 * Class decorator.
	 * Make all properties/accessors to koObservable/koComputed.
	 * Points to consider.
	 * 1. Properties that are not initialized at declare or in constructor don't become koObservable.
	 * 2. In order to recognize a array property as koObservableArray, it is necessary to set a array value first(e.g set [] ).
	 * 3. Accessors become pure koComputed.
	 * 4. A property/accessor with `@ignore` don't become koObservable.
	 * 5. In order to use raw koObservable, it is necessary to be not inside constructor but after executed constructor.
	 */
	export function track( options: ITrackOptions ): any;
	export function track( arg: any ): any
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
				initializeMethod: null,
				init: null
			} as ITrackOptions;
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
		}

		function classFactory( constructor: Function )
		{
			let kd = KnockoutDecoratorClassInfo.Get( constructor );
			let trackConstructor: any = function ()
			{
				constructor.apply( this, arguments );
				let o = this;

				let properties = Object.keys( o );
				let len = properties.length;
				for ( var i = 0; i < len; ++i )
				{
					let p = properties[i];
					if ( p === KnockoutDecoratorObjInfo.Key ||
						kd.isIgnoreProperty( p ) ||
						getObservable( o, p ) ||
						getObservableArray( o, p ) )
					{
						continue;
					}

					let v = o[p];
					delete o[p];
					if ( Array.isArray( v ) )
					{
						observableArray( trackConstructor.prototype, p );
					}
					else
					{
						observable( trackConstructor.prototype, p );
					}
					o[p] = v;
				}

				let functions = Object.keys( constructor.prototype );
				let computedAccessors: any[] = [];
				len = functions.length;
				for ( let i = 0; i < len; ++i )
				{
					let f = functions[i];
					let d = Object.getOwnPropertyDescriptor( constructor.prototype, f );
					if ( !d || !d.get ) continue;
					if ( kd.isIgnoreProperty( f ) ) continue;

					// If be Overrided descriptor already, accessor become koComputed by executing the following;
					let dummy = o[f];
					if ( getComputed( o, f ) ) continue;

					let factory = getComputedDecoratorFactory( {
						pure: options.pureComputed
					} );
					factory( trackConstructor.prototype, f, d );
					Object.defineProperty( trackConstructor.prototype, f, d );
					computedAccessors.push( f );
				}
				// In order to make koComputed, call getter.
				len = computedAccessors.length;
				for ( let i = 0; i < len; ++i )
				{
					o[computedAccessors[i]];
				}
				
				if ( options.init && typeof o[options.init] === "function" )
				{
					o[options.init]();
				}
				if ( options.initializeMethod && typeof o[options.initializeMethod] === "function" )
				{
					o[options.initializeMethod]();
				}
			}
			trackConstructor["prototype"] = constructor["prototype"];
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

	/**
	 * Property/Accessor decorator.
	 * Prevent a property/accessor from making koObservable in @trak.
	 */
	export function ignore( target: any, property: string ): void
	{
		KnockoutDecoratorClassInfo.Get( target ).pushIgnoreProperty( property );
	}

	/**
	 * Property decorator.
	 * Make a property koObservable.
	 */
	export function observable( prototype: Object, property: string ): void
	{
		Object.defineProperty( prototype, property, {
			get: function (): any
			{
				KnockoutDecoratorObjInfo.Get( this ).makeObservable( property );
				return this[property];
			},
			set: function ( value: any ): void
			{
				KnockoutDecoratorObjInfo.Get( this ).makeObservable( property );
				this[property] = value;
			}
		} );
	}

	/**
	 * Property decorator.
	 * Make a property koObservableArray.
	 */
	export function observableArray( prototype: any, property: string ): void
	{
		Object.defineProperty( prototype, property, {
			get: function (): any[]
			{
				KnockoutDecoratorObjInfo.Get( this ).makeObservableArray( property );
				return this[property];
			},
			set: function ( arrayValue: any ): void
			{
				KnockoutDecoratorObjInfo.Get( this ).makeObservableArray( property );
				this[property] = arrayValue;
			}
		} );
	}

	/**
	 * Accessor decorator.
	 * At least require getter.
	 * Make a accessor koComputed. If setter is defined, make it writable computed.
	 */
	export function computed( prototype: any, propertyName: string, descriptor: PropertyDescriptor ): void
	/**
	 * Accessor decorator.
	 * At least require getter.
	 * Make a accessor koComputed. If setter is defined, make it writable computed.
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
	 * Accessor decorator.
	 * At least require getter.
	 * Make a accessor koPureComputed. If setter is defined, make it writable computed.
	 */
	export function pureComputed( prototype: any, propertyName: string, descriptor: PropertyDescriptor ): void
	{
		getComputedDecoratorFactory( { pure: true } )( prototype, propertyName, descriptor );
	}

	/**
	 * Property/Accessor decorator.
	 * @param options	Set options which is defined ko.extenders such as rateLimit.
	 */
	export function extend( options: { [key: string]: any } ): any
	{
		return ( prototype: any, name: string, descriptor?: PropertyDescriptor ) =>
		{
			KnockoutDecoratorClassInfo.Get( prototype ).pushKoExtend( name, options );
		};
	}

	//#region set filter decorators
	/**
	 * Property/Setter decorator.
	 * A value set to a property becom return value of filter.
	 * If there is multiple set filter decorators for a property, there are executed in the order from bottom to top.
	 * @param filterFunc function that return a processed value.
	 */
	export function setFilter( filterFunc: ( setValue: any ) => any ): any // PropertyDecorator | MethodDecorator
	{
		return ( prototype: any, property: string ) =>
		{
			KnockoutDecoratorClassInfo.Get( prototype ).pushSetFilter( property, filterFunc );
		};
	}

	/**
	 * Set filter decorator.
	 * Variable keeps numerical type.
	 * If set value is NaN, it become zero.
	 */
	export function asNumber( prototype: any, property: string ): any
	{
		KnockoutDecoratorClassInfo.Get( prototype ).pushSetFilter( property, v =>
		{
			if ( !v || typeof v === "number" ) return v;
			v = parseFloat( v );
			return isNaN( v ) ? 0 : v;
		} );
	}

	/**
	 * Set filter decorator.
	 * Variable keeps greater than or equal to minValue.
	 */
	export function min( minValue: number ): any // PropertyDecorator | MethodDecorator
	{
		return setFilter( v => v < minValue ? minValue : v );
	}

	/**
	 * Set filter decorator.
	 * Variable keeps less than or equal to maxValue.
	 * @extend require attaching observable decorator.
	 */
	export function max( maxValue: number ): any // PropertyDecorator | MethodDecorator
	{
		return setFilter( v => v > maxValue ? maxValue : v );
	}

	/**
	 * Set filter decorator.
	 * Variable keeps between minValue and maxValue inclusive.
	 */
	export function clamp( minValue: number, maxValue: number ): any // PropertyDecorator | MethodDecorator
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
		} );
	}
	//#endregion

	/**
	 * Get raw knockout observable object.
	 * @param target	Target object.
	 * @param property	Name of a property which is attached the @observable.
	 * @return If found then KnockoutObservable object, else null.
	 */
	export function getObservable<T>( target: any, property: string ): KnockoutObservable<T>;
	/**
	 * Get raw knockout observable object.
	 * @param propertyAccess	execute propety access. e.g. "() => this.property".
	 */
	export function getObservable<T>( propertyAccess: () => T ): KnockoutObservable<T>;
	export function getObservable<T>(): KnockoutObservable<T>
	{
		if ( typeof arguments[0] === "function" )
		{
			lastGetKoObservable = null;	// reset
			arguments[0]();
			let res = lastGetKoObservable;
			lastGetKoObservable = null;
			return res;
		}
		else
		{
			let target = arguments[0];
			let property = arguments[1];
			return KnockoutDecoratorObjInfo.Get( target ).getObservable<T>( property );
		}
	}
	
	/**
	 * Get row knockout observable array object.
	 * @param target	Target object.
	 * @param property	Name of a property which is attached the @observableArray.
	 */
	export function getObservableArray<T>( target: any, property: string ): KnockoutObservableArray<T>;
	/**
	 * Get row knockout observable array object.
	 * @param propertyAccess	execute propety access. e.g. "() => this.property".
	 */
	export function getObservableArray<T>( propertyAccess: () => T[] ): KnockoutObservableArray<T>;
	export function getObservableArray<T>(): KnockoutObservableArray<T>
	{
		if ( typeof arguments[0] === "function" )
		{
			lastGetKoObservableArray = null;	// reset
			arguments[0]();
			let res = lastGetKoObservableArray;
			lastGetKoObservable = null;
			return res;
		}
		else
		{
			let target = arguments[0];
			let property = arguments[1];
			return KnockoutDecoratorObjInfo.Get( target ).getObservableArray<T>( property );
		}
	}

	/**
	 * Get raw knockout computed object.
	 * @param target	Target object.
	 * @param property	Name of a accessor which is attached the @computed.
	 * @return If found then KnockoutComputed object, else null.
	 */
	export function getComputed<T>( target: any, accessor: string ): KnockoutComputed<T>;
	/**
	 * Get raw knockout computed object.
	 * @param getterAccess	execute getter. e.g. "() => this.getter".
	 * @return If found then KnockoutComputed object, else null.
	 */
	export function getComputed<T>( getterAccess:()=>T ): KnockoutComputed<T>;
	export function getComputed<T>(): KnockoutComputed<T>
	{
		if ( typeof arguments[0] === "function" )
		{
			lastGetKoComputed = null;	// reset
			arguments[0]();
			let res = lastGetKoComputed;
			lastGetKoComputed = null;
			return res;
		}
		else
		{
			let target = arguments[0];
			let accessor = arguments[1];
			return KnockoutDecoratorObjInfo.Get( target ).getComputed<T>( accessor );
		}
		
	}

	// #region no export

	/** @private */
	function getComputedDecoratorFactory( options: IComputedOptions ): MethodDecorator
	{
		return ( prototype: Object, accessor: string, descriptor: PropertyDescriptor ) =>
		{
			let getter = descriptor.get;
			if ( !getter )
			{
				throw "@Computed and @pureComputed require getter.";
			}
			let setter = descriptor.set;

			descriptor.get = function ()
			{
				KnockoutDecoratorObjInfo.Get( this ).makeComputed( accessor, getter, setter, options );
				return this[accessor];
			}
			if ( setter )
			{
				descriptor.set = function ( value )
				{
					KnockoutDecoratorObjInfo.Get( this ).makeComputed( accessor, getter, setter, options );
					this[accessor] = value;
				}
			}
		}
	}

	let lastGetKoObservable: KnockoutObservable<any> = null;
	let lastGetKoObservableArray: KnockoutObservableArray<any> = null;
	let lastGetKoComputed: KnockoutComputed<any> = null;

	// Information that class should have.
	class KnockoutDecoratorClassInfo
	{
		public static Get( constructor: Function ): KnockoutDecoratorClassInfo;
		public static Get( prototype: Object ): KnockoutDecoratorClassInfo;
		public static Get( target: any ): KnockoutDecoratorClassInfo
		{
			target = ( typeof target == "function" ) ? target.prototype : target;
			if ( !target[KnockoutDecoratorClassInfo.Key] )
			{
				target[KnockoutDecoratorClassInfo.Key] = new this();
			}
			return target[KnockoutDecoratorClassInfo.Key];
		}

		public pushIgnoreProperty( property: string ): void
		{
			if ( !this.ignoreProperties ) this.ignoreProperties = [];
			this.ignoreProperties.push( property );
		}
		public isIgnoreProperty( property: string ): boolean
		{
			return this.ignoreProperties &&
				this.ignoreProperties.indexOf( property ) != -1;
		}

		public pushKoExtend( name: string, extendOptions: any ): void
		{
			if ( !this.extendsHash ) this.extendsHash = {};
			if ( !this.extendsHash[name] ) this.extendsHash[name] = [];
			this.extendsHash[name].push( extendOptions );
		}

		public applyKoExtend( target: string, o: KnockoutObservable<any> ): void
		{
			if ( !this.extendsHash ) return;
			let extendArr = this.extendsHash[target];
			if ( !extendArr ) return;
			let len = extendArr.length;
			for ( let i = 0; i < len; ++i )
			{
				o.extend( extendArr[i] );
			}
		}

		public pushSetFilter( property: string, filterFunc: ( v: any ) => any )
		{
			if ( !this.setFiltersHash ) this.setFiltersHash = {};
			let filters = this.setFiltersHash[property]
			if ( !filters )
			{
				filters = this.setFiltersHash[property] = [];
			}
			filters.push( filterFunc );
		}

		public getSetter( target: string, o: KnockoutObservable<any> ): any
		{
			if ( !this.setFiltersHash ) return o;
			let filters = this.setFiltersHash[target];
			if ( !filters ) return o;
			let len = filters.length;
			return ( v: any ) =>
			{
				for ( let i = 0; i < len; ++i )
				{
					v = filters[i]( v );
				}
				o( v );
			}
		}

		public static readonly Key = "__vtKnockoutDecoratorClassInfo__";
		private ignoreProperties: string[];
		private extendsHash: { [property: string]: any[] };
		private setFiltersHash: { [property: string]: ( ( v: any ) => any )[] }

		private constructor() { }
	}

	// Information that instanced object should have.
	class KnockoutDecoratorObjInfo
	{
		public static Get( target: any ): KnockoutDecoratorObjInfo
		{
			if ( !target[KnockoutDecoratorObjInfo.Key] )
			{
				target[KnockoutDecoratorObjInfo.Key] = new this( target );
			}
			return target[KnockoutDecoratorObjInfo.Key];
		}

		public makeObservable( property: string ): void
		{
			let o = ko.observable<any>();
			this.koObservableHash[property] = o;
			let prototype = Object.getPrototypeOf( this.target )
			let classInfo = KnockoutDecoratorClassInfo.Get( prototype );
			classInfo.applyKoExtend( property, o ); KnockoutDecoratorClassInfo.Get( prototype )
			Object.defineProperty( this.target, property, {
				get: () =>
				{
					lastGetKoObservable = o;
					return o();
				},
				set: classInfo.getSetter( property, o )
			} );
		}

		public makeObservableArray( property: string ): void
		{
			function replaceFunction( src: any[], o: KnockoutObservableArray<any> )
			{
				let originals: { [fn: string]: Function } = {};
				["splice", "pop", "push", "shift", "unshift", "reverse", "sort"].forEach( fnName =>
				{
					originals[fnName] = ( <any>src )[fnName];
					let mimicry = function ()
					{
						// restore the original function for call it inside ObservableArray.
						( <any>src )[fnName] = originals[fnName];

						// call ObservableArray function
						let res = ( o[fnName] as Function ).apply( o, arguments );

						// rewrite the original function again.
						( <any>src )[fnName] = mimicry;

						return res;
					};

					// rewrite the original function
					( <any>src )[fnName] = mimicry;
				} );
			}
			function mergeFunction( src: any[], o: KnockoutObservableArray<any> )
			{
				["replace", "remove", "removeAll", "destroy", "destroyAll"].forEach( fnName =>
				{
					( <any>src )[fnName] = function ()
					{
						return ( o[fnName] as Function ).apply( o, arguments );
					};
				} );
			}

			let o = ko.observableArray<any>();
			this.koObservableArrayHash[property] = o;
			let prototype = Object.getPrototypeOf( this.target )
			let classInfo = KnockoutDecoratorClassInfo.Get( prototype );
			classInfo.applyKoExtend( property, o ); KnockoutDecoratorClassInfo.Get( prototype )

			Object.defineProperty( this.target, property, {
				get: () =>
				{
					lastGetKoObservableArray = o;
					return o();
				},
				set: function ( arrayValue: any[] )
				{
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
			let computedOptions: KnockoutComputedDefine<any> = {
				read: getter,
				write: setter,
				owner: this.target
			};
			if ( options )
			{
				for ( let key in options )
				{
					( <any>computedOptions )[key] = ( <any>options )[key];
				}
			}
			let c = ko.computed( computedOptions );
			this.koComputedHash[accessor] = c;
			let prototype = Object.getPrototypeOf( this.target )
			let classInfo = KnockoutDecoratorClassInfo.Get( prototype );
			classInfo.applyKoExtend( accessor, c );
			Object.defineProperty( this.target, accessor, {
				get:() =>
				{
					lastGetKoComputed = c;
					return c();
				},
				set: setter ? classInfo.getSetter( accessor, c ) : undefined
			} );
		}

		public getObservable<T>( property: string ): KnockoutObservable<T>
		{
			return this.koObservableHash[property];
		}

		public getObservableArray<T>( property: string ): KnockoutObservableArray<T>
		{
			return this.koObservableArrayHash[property];
		}

		public getComputed<T>( accessor: string ): KnockoutComputed<T>
		{
			return this.koComputedHash[accessor];
		}

		public static readonly Key = "__vtKnockoutDecoratorObjInfo__";
		private target: any;
		private koObservableHash: { [property: string]: KnockoutObservable<any> } = {};
		private koObservableArrayHash: { [property: string]: KnockoutObservableArray<any> } = {};
		private koComputedHash: { [accessor: string]: KnockoutComputed<any> } = {};

		private constructor( target: any )
		{
			this.target = target;
		}
	}
	// #endregion

	// export default module
	if ( typeof exports !== typeof undefined )
	{
		module.exports = KnockoutDecorator;
		module.exports["default"] = KnockoutDecorator;
	}
}

export = KnockoutDecorator;
