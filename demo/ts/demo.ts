/// <reference path="../../src/knockout-decorator.ts" />

var vt = variotry.KnockoutDecorator;
type ObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;

ko.bindingHandlers["disableBinding"] =
{
	init: ( element: any, valueAccessor: () => boolean ) =>
	{
		return { controlsDescendantBindings: valueAccessor() };
	}
}

class DemoWithDecorator
{
	@vt.observable
	private firstName = "vario";

	@vt.observable
	private lastName = "try";

	@vt.pureComputed
	private get fullName(): string
	{
		return this.firstName + " " + this.lastName;
	}

	@vt.observableArray
	private list = ["data1", "data2", "data3"];

	@vt.observable
	private pushValue = "";

	@vt.observable
	public isVisible = false;

	private onPush(): void
	{
		this.list.push( this.pushValue );
	}

	private onPop(): void
	{
		this.list.pop();
	}
}

class DemoWithoutDecorator
{
	private firstName = ko.observable( "vario" );
	private lastName = ko.observable( "try" );
	private fullName = ko.computed(() => this.firstName() + " " + this.lastName() );

	private list = ko.observableArray(["data1", "data2", "data3"] );

	private pushValue = ko.observable( "" );

	private isVisible = ko.observable( false );
	public setVisible( v: boolean ): void
	{
		this.isVisible( v );
	}

	private onPush(): void
	{
		this.list.push( this.pushValue() );
	}

	private onPop(): void
	{
		this.list.pop();
	}
}



let d1 = new DemoWithDecorator();
let d2 = new DemoWithoutDecorator();
ko.applyBindings( d1, document.getElementById( "withDecorator" ) );
ko.applyBindings( d2, document.getElementById( "withoutDecorator" ) );


class Nav
{
	@vt.observable
	private page = "with";

	public constructor( d1: DemoWithDecorator, d2: DemoWithoutDecorator )
	{
		ko.applyBindings( this, document.getElementById( "tab" ) );
		this.changePage();
	}

	private changePage()
	{
		d1.isVisible = this.page === "with";
		d2.setVisible( this.page === "without" );
	}

	private onClickTab( page: string ): void
	{
		if ( this.page === page ) return;
		this.page = page;
		this.changePage();
	}
}
new Nav( d1, d2 );