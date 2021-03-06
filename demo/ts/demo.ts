﻿// use webpack etc.
// Write to 'import kd from "knockout-decorator"' in your projects.
import kd from "../../";	// <-- import knockout-decorator module.

// knockout-decorator require global 'ko' variable.
// If you bundle knockoutjs to a one js using webpack, write as follows.
import * as ko from "knockout";
( <any>window ).ko = ko;

// use as global.
/*
///<reference path="../../dist-globalDefinition/knockout-decorator.d.ts" />
import kd = KnockoutDecorator;	// alias
*/

ko.bindingHandlers["disableBinding"] =
{
	init: ( element: any, valueAccessor: () => boolean ) =>
	{
		return { controlsDescendantBindings: valueAccessor() };
	}
}

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
	private list = ["data1", "data2", "data3"] as kd.IObservableArray<string>;

	@kd.observable
	private pushData = "";

	@kd.observable
	public pushErrorMsg = "";

	@kd.observableArray
	private removeTargets = [] as kd.IObservableArray<string>;

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

	@kd.observable
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
