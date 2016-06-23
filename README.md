# knockout-decorator

This plug-in provides the function of Knockout observable as if to use usual property. 

## Install

Write as below on a html.

    <script src="path/knockout.js"></script>
    <script src="path/knockout-decorator.js"></script>
    
## Usage

First define a shortName such as `var vt = variotry.KnockoutDecorator`.

### 1.Use observable object

Just attach "@vt.observable" to a property as below.

    @vt.observable
    public firstName = "Bob";

This code is similar to `public firstName = ko.observable("Bob")`.

However, when you access the property, you need not write parentheses.

If you set the propety to a value ( e.g. `this.firstName = "John"` ) , a view will also update, and vice versa.

### 2.Use observable array

Just attach "@vt.observableArray" to a Array type property as below.

    @vt.observableArray
    public list = [ "data1", "data2", "data3" ];
    
This code is similar to `public list = ko.observableArray([ "data1", "data2", "data3" ])`.

If you set the property to a new array data ( e.g. `this.list = ["newData1", "newData2"]` ), a view will also update. 

If you call Array function such as push or pop  ( e.g. `this.list.push("data4")`) , a view will also update.

You can easily access KnockoubObservableArray functions via intellisense by converting as below.

    @vt.observableArray
    public list = [ "data1", "data2", "data3" ] as IObservableArray<string>;
    
(Define IObservableArray&lt;T&gt; as `type IObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;` )

### 3.Use computed

Just attach "@vt.computed" to a accessor as below.

    @vt.observable
    public firstName = "Bob";
    
    @vt.observable
    public lastName = "Smith";
    
    @vt.computed
    public get fullName() { return this.firstName + " " + this.lastName; }

This code similar to `public firstName  = ko.computed( () => this.firstName + " " + this.lastName )`.

When firstName or lastname is change, fullName getter will be called.

In addition, you can treat as writable computed if you define also setter.

## Requirement

knockout(http://knockoutjs.com/)

tsConfig.json compilerOptions.experimentalDecorators set true

 es5 support browser

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

## Author

[vario](https://github.com/variotry/)
