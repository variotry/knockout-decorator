let kd = variotry.KnockoutDecorator;
type IObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;

/*ko.bindingHandlers["disableBinding"] =
{
	init: ( element: any, valueAccessor: () => boolean ) =>
	{
		return { controlsDescendantBindings: valueAccessor() };
	}
}*/

class ObservableVariablesDemo
{
	@kd.observable
	private firstName = "vario";

	@kd.observable
	private lastName = "try";

	@kd.pureComputed
	@kd.extend( { rateLimit: 1 } )
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
	@kd.observableArray
	private list = ["data1", "data2", "data3"] as IObservableArray<string>;

	@kd.observable
	private pushData = "";

	@kd.observable
	public pushErrorMsg = "";

	@kd.observableArray
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

@kd.track
class Nav
{
	private items: string[];
	private selectedIndex: number = 0;

	public constructor()
	{
		this.items = [];
		for ( let i = 1; i <= 2; ++i )
		{
			this.items.push( "demo" + i );
		}
	}

	private onChange( index: number ): void
	{
		this.selectedIndex = index;
	}
}

// @track decorator simple demo.
@kd.track
class Demo1
{
	// properties is recognized as observable.
	private firstName = "vario";
	private lastName = "try";

	// accessors is recognized as pure computed.
	public get name()
	{
		return this.firstName + " " + this.lastName;
	}

	// @track do nothing for methods.
	private onReset(): void
	{
		this.firstName = "vario";
		this.lastName = "try";
	}
}

@kd.track
class Demo2
{
	// @asNumber decorator always keeps number type.
	@kd.asNumber
	private x = 10;

	@kd.asNumber
	private y = 20;

	public get total()
	{
		return this.x + this.y;
	}
	// setter is recognized as writable (pure) computed.
	public set total( v: number )
	{
		this.x = v / 3;
		this.y = v * 2 / 3;
	}

	// @ignore decorator won't be recognized as observable.
	@kd.ignore
	public ignoreParam: string = "ignore";
	
	private onReset(): void
	{
		this.x = 10;
		this.y = 20;
	}
}


class Demo
{
	private nav = new Nav();
	private demo1 = new Demo1();
	private demo2 = new Demo2();
	//private observableDemo: ObservableVariablesDemo;
	//private observableArrayDemo: ObservableArrayDemo;

	public constructor()
	{
		/*this.observableDemo = new ObservableVariablesDemo();
		this.observableArrayDemo = new ObservableArrayDemo();
		ko.applyBindings( this, document.body );*/
		//ko.applyBindings( new Nav(), document.getElementById( "tab" ) );
		//ko.applyBindings( new TrackDemo(), document.getElementById( "trackView" ) );
		ko.applyBindings( this, document.getElementById( "main" ) );
	}
}

new Demo();