/// <reference path="../../src/knockout-decorator.ts" />

var vt = variotry.KnockoutDecorator;

class Demo
{
	@vt.observable
	public firstName: string = "";

	@vt.observable
	private familyName: string = "";

	@vt.computed()
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

	public constructor()
	{
		var node = document.getElementById( "content" );
		ko.applyBindings( this, node );

		// test get observable object from property name.
		vt.getObservable<string>( this, "firstName" ).subscribe( newValue =>
		{
			console.log( "new value is", newValue );
		});
	}
}
new Demo();
