# knockout-decorator

This plug-in makes it easier for you to write a code with knockout observable.

## Demo

See https://demo.variotry.com/knockoutDecorator/ or demo/index.html.

(I have checked demo with Google Chrome, IE11, Edge and firefox.)
    
## Usage

Copy .js and d.ts inside dist directory in any directory and write as below on a html.

    <script src="path/knockout.js"></script>
    <script src="path/knockout-decorator.js"></script>
	<script src="yourScript.js"></script>

And define a shortName such as `var vt = variotry.KnockoutDecorator`.

### 1.Use observable object

Just attach "@vt.observable" to a property as below.

    @vt.observable
    public firstName = "Bob";

This code is similar to `public firstName = ko.observable("Bob")`.

If you set the propety to a value ( e.g. `this.firstName = "John"` ) , a view will also update, and vice versa.

### 2.Use observable array

Just attach "@vt.observableArray" to an Array type property as below.

    @vt.observableArray
    public list = [ "data1", "data2", "data3" ];
    
This code is similar to `public list = ko.observableArray([ "data1", "data2", "data3" ])`.

If you set the property to a new array data ( e.g. `this.list = ["newData1", "newData2"]` ), a view will also update. 

If you call Array function such as push or pop  ( e.g. `this.list.push("data4")`) , a view will also update.

You can easily access KnockoubObservableArray functions via intellisense by converting as below.

    @vt.observableArray
    public list = [ "data1", "data2", "data3" ] as IObservableArray<string>;
    
(Define IObservableArray&lt;T&gt; as `type IObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;` )

### 3.Use pureComputed and computed

Just attach "@vt.pureComputed" or "@vt.computed" to an accessor as below.

    @vt.observable
    public firstName = "Bob";
    
    @vt.observable
    public lastName = "Smith";
    
    @vt.pureComputed
    public get fullName() { return this.firstName + " " + this.lastName; }

This code similar to `public firstName  = ko.pureComputed( () => this.firstName + " " + this.lastName )`.

When firstName or lastName is change, fullName getter will be called.

In addition, you can treat firstName as writable computed if you define also setter.

### 4.Use extenders

Just attach "@vt.extend to a property or accessor which is attached observable decorator as below.

    @vt.pureComputed
    @vt.extend( { rateLimit: 500 } )
    public get fullName() { return this.firstName + " " + this.lastName; }
    
This code similar to `public firstName  = ko.pureComputed( () => this.firstName + " " + this.lastName ).extend( { rateLimit: 500 } );`


### 5.Get raw knockout observable object

You can get a knockout observable object by using below functions.

    getObservable<T>
    getObservableArray<T>
    getComputed<T>
    
Example of use.

    vt.getObservable<string>( this, "firstName" ).subscribe( newValue =>
    {
        console.log( "firstName value is", newValue );
    });


## Requirement

knockout(http://knockoutjs.com/)

tsConfig.json compilerOptions.experimentalDecorators set true

es5 support browser

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

## Author

[vario](https://github.com/variotry/)
