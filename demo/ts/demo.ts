let vt = variotry.KnockoutDecorator;
type IObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;

ko.bindingHandlers["disableBinding"] =
{
	init: ( element: any, valueAccessor: () => boolean ) =>
	{
		return { controlsDescendantBindings: valueAccessor() };
	}
}

class ObservableVariablesDemo
{
	@vt.observable
	private firstName = "vario";

	@vt.observable
	private lastName = "try";

	@vt.pureComputed
	@vt.extend( { rateLimit: 1 } )
	private get fullName(): string
	{
		return this.firstName + " " + this.lastName;
	}

	private onReset()
	{
		this.firstName = "vario";
		this.lastName = "try";
	}
	
}

class ObservableArrayDemo
{
	@vt.observableArray
	private list = ["data1", "data2", "data3"] as IObservableArray<string>;

	@vt.observable
	private pushData = "";

	@vt.observable
	public pushErrorMsg = "";

	@vt.observableArray
	private removeTargets = [] as IObservableArray<string>;

	private onPush(): void
	{
		if ( !this.pushData.trim() ) return;
		if ( 0 <= this.list.indexOf( this.pushData ) )
		{
			this.pushErrorMsg = "'" + this.pushData + "' already exists.";
			return;
		}
		this.pushErrorMsg = "";

		this.list.push( this.pushData );
		this.pushData = "";
	}

	private onPop(): void
	{
		this.removeTargets.remove( this.list.pop() );
	}

	private onRemove(): void
	{
		this.removeTargets.forEach( data =>
		{
			this.list.remove( data );
		});
		this.removeTargets.removeAll();
	}
}


interface INavItem
{
	uid: string;
	title: string;
}
class Nav
{
	private items: INavItem[] = [
		{ uid: "observable", title: "observe variables" },
		{ uid: "observableArray", title: "observe array" }
	];

	@vt.observable
	private uid: string;

	public constructor()
	{
		this.uid = this.items[0].uid;
	}

	private onClickTab( item: INavItem ): void
	{
		this.uid = item.uid;
	}
}

class Demo
{
	private nav: Nav;
	private observableDemo: ObservableVariablesDemo;
	private observableArrayDemo: ObservableArrayDemo;

	public constructor()
	{
		this.nav = new Nav();
		this.observableDemo = new ObservableVariablesDemo();
		this.observableArrayDemo = new ObservableArrayDemo();
		ko.applyBindings( this, document.body );
	}
}

new Demo();