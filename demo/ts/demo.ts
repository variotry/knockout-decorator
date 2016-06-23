/// <reference path="../../src/knockout-decorator.ts" />

var vt = variotry.KnockoutDecorator;
type ObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;

class Demo
{
	@vt.observable
	private firstName: string = "vario";

	@vt.observable
	private familyName: string = "try";

	@vt.computed
	private get fullName() { return this.firstName + " " + this.familyName; }
	private set fullName( name : string )
	{
		var items = name.split( " ", 2 );
		this.firstName = items[0];
		console.log( items.length );
		if ( items.length > 1 )
		{
			this.familyName = items[1];
		}
		else
		{
			this.familyName = "";
		}
	}

	@vt.observableArray
	public list = ["a", "x", "t"] as ObservableArray<string>;

	public list2 = ko.observableArray( ["a", "x", "t"] );

	public constructor()
	{
		var node = document.getElementById( "content" );
		ko.applyBindings( this, node );

		// test get observable object from property name.
		vt.getObservable<string>( this, "firstName" ).subscribe( newValue =>
		{
			console.log( "new value is", newValue );
		});

		//this.list.push( "d" );
		this.list.push( "0" );
		this.list.push( "i" );
		this.list.push( "v" );

		this.list2.push( "0" );
		this.list2.push( "i" );
		this.list2.push( "v" );

		var o1 = vt.getObservable<string>( this, "firstName" );
		var o2 = vt.getObservableArray<string>( this, "list" );
		var o3 = vt.getObservable<string>( this, "fullName" );

		setTimeout(() =>
		{
			//var o: KnockoutObservableArray<string>;

			//var a = this.list.slice( 1, 3 );
			//var a2 = this.list2.slice( 1, 3 );
			//console.log( a, a2 );

			//var b = this.list.splice( 1, 2, "insertA", "insertB", "insertC" );
			//var b2 = this.list2.splice( 1, 2, "insertA", "insertB", "insertC" );
			//console.log( b, b2 );

			//var c = this.list.shift();
			//var c2 = this.list2.shift();
			//console.log( c, c2 );

			//var d = this.list.unshift( "newA", "newB" );
			//var d2 = this.list2.unshift( "newA", "newB" );
			//console.log( d, d2 );

			//var e = this.list.reverse();
			//var e2 = this.list2.reverse();
			//console.log( e, e2 );

			/*var f = this.list.sort();
			var f2 = this.list2.sort();
			console.log( f, f2 );*/

			/*var g = this.list.remove( "x" ); 
			var g2 = this.list2.remove( "x" ); 
			console.log( g, g2 );*/

			/*var h = this.list.removeAll();
			var h2= this.list2.removeAll();
			console.log( h, h2 );*/

			/*var i = this.list.replace( "x", "newX" );
			var i2 = this.list2.replace( "x", "newX" );
			console.log( i, i2 );*/
					
			this.list.push( "g" );
			this.list.push( "h" );
			this.list.push( "i" );

			this.list2.push( "g" );
			this.list2.push( "h" );
			this.list2.push( "i" );
		
			popArray();
		}, 1000 );

		var popArray = () =>
		{
			var id = setInterval(() =>
			{
				this.list.pop();
				this.list2.pop();
				if ( this.list.length === 0 && this.list2.length === 0 )
				{
					clearInterval( id );
				}
			}, 1000 );
		}

		

		

	}
}
new Demo();
