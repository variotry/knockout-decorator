# knockout-decorator

This plug-in makes it easier for you to write a code with knockout observable.

See [demo](https://variotry.github.io/knockout-decorator/).(Require es5 support browser.)

## Usage

Copy `.js` and `d.ts` inside dist directory in any directory and write on a html as follows.

    <script src="path/knockout.js"></script>
    <script src="path/knockout-decorator.min.js"></script>
	<script src="yourScript.js"></script>

And define a shortName such as `import kd = KnockoutDecorator`.

### Decorators

* [`@track` and `@ignore`](#use-track-decorator)
* [`@observable`](#use-observable-decorator)
* [`@observableArray`](#use-observablearray-decorator)
* [`@pureComputed or @computed`](#use-purecomputed-or-computed-decorator)
* [`@extend`](#use-extend-decorator)
* [`@asNumber`](#added-feature)

#### Use `@track` decorator 

`@track` decorator will convert all properties or accessors to observable.

Attach `kd.@track` to a class as follows.

    @kd.track
    class Sample
    {
        private firstName = "Vario";
        private lastName = "Try";
        
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }
    }

This code is similar to the code below.

    class Sample
    {
        private firstName = ko.observable("Vario");
        private lastName = ko.observable("Try");

        private name = ko.computed( () => this.firstName() + " " + this.lastName() );
    }

However, decorator simplifies your codes.

If you set a value to a property ( e.g. `this.firstName = "Bob" `), a view will also update, and vice versa.

And, name getter also will be executed.

see [demo1](https://variotry.github.io/knockout-decorator/)

`@track` decorator has points to consider.

  1.Have to initialize properties at place of declaration or in constructor to be recognized as observable.(set `null` is OK also)

    @kd.track
    class Sample1
    {
        private property1 : string = null;  // OK. property1 is recoginzed as observable.
        private property2 : string;         // NG. property2 isn't recognized as observable because of it isn't initialized 
        private property3 : string;         // OK. property3 is recoginzed as observable because of it is initiazlied in constructor.

        public constructor()
        {
            this.property3 = "value";
        }
    }

  2.Have to set array value for array properties to be recognized as oservable array. If you first set null to a array property, the property will recognize as KnockoutObservable&lt;T[]>, not KnockoutObservableArray&lt;T>.

    @kd.track
    class Sample2
    {
        private array1 : string[] = [];     // array1 is recoginzed as KnockoutObservableArray<string>.
        private array2 : string[] = null;   // array2 is recognized as KnockoutObservable<string[]>.
    }

  3.Accessors will be converted to pure computed. If you want to use non pure computed, pass { pureComputed:false } to `@track` or attach `@computed` decorator to accessors.

    @kd.track
    class Sample3_1
    {
        private firstName = "Vario";
        private lastName = "Try";

        // name accessor is recognized as pure computed.
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }

        // name2 accessor is recognized as pure computed.
        private get name2()
        {
            return this.firstName + " " + this.lastName;
        }
    }

    @kd.track({pureComputed:false})
    class Sample3_2
    {
        private firstName = "Vario";
        private lastName = "Try";

        // name accessor is recognized as (non pure) computed.
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }

        // name2 accessor is recognized as (non pure) computed.
        private get name2()
        {
            return this.firstName + " " + this.lastName;
        }
    }

    @kd.track
    class Sample3_2
    {
        private firstName = "Vario";
        private lastName = "Try";

        // name accessor is recognized as (non pure) computed.
        @computed
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }

        // name2 accessor is recognized as pure computed.
        private get name2()
        {
            return this.firstName + " " + this.lastName;
        }
    }



  4.If you want to prevent properties or accessors from converting to observable, attach `@ignore` decorator to them. See [demo2](https://variotry.github.io/knockout-decorator/#demo2)

    @kd.track
    class Sample4
    {
        private firstName = "Vario";

        @kd.ignore
        private lastName = "Try";  // lastName isn't recognized as observable.
    }

  5.You can't get or use observable objects in a constructor.

    // initializeMethod option is name of executed method after constructor finish.
    @kd.track( {initializeMethod:"init"} )
    class Sample5
    {
        private property = "";
        private array = [] as kd.IObservableArray<string>;

        public constructor()
        {
            let rawObservable = @kd.getObservable<string>( this, "property" );
            // rawObservable will be null.

            // you must not execute Knockout Observable Array functions.
            // this.array.remove( ... );
        }

        // init is exexuted after constructor finish.
        public init()
        {
            let rawObservable = @kd.getObservable<string>( this, "property" );
            // rawObservable will set raw observable object.

            // you can execute Knockout Observable Array functions.
            this.array.remove( ... );
        }
    }


#### Use `@observable` decorator

`@observable` decorator will convert to observable for individual properties.

Attach `@kd.observable` to a property as follows.

    class Sample
    {
        @kd.observable
        public firstName = "Vario";    // firstName is recognized as observable.

        public lastName = "Tray";      // lastName isn't recognized as observable.

        public constructor()
        {
            let rawObservable = @kd.getObservable<string>( this, "firstName" );
            // rawObservable will set raw observable object.
            // Unlike @track decorator, you can get or use observable object in constructor.
        }
    }

#### Use `@observableArray` decorator

`@observableArray` decorator will convert to observable array for individual array properties.

Attach "@kd.observableArray" to an Array property as follows.

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ];
    
If you set the property to a new array data ( e.g. `this.list = ["newData1", "newData2"]` ), a view will also update. 

If you call Array function such as push or pop  ( e.g. `this.list.push("data4")`) , a view will also update.

You can easily access KnockoubObservableArray functions via intellisense by converting as follows.

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ] as kd.IObservableArray<string>;

See [demo3](https://variotry.github.io/knockout-decorator/#demo3)

#### Use `@pureComputed` or `@computed` decorator

`@pureComputed` and `@computed` decorator will convert to (pure) computed for individual accessors.

Attach "@kd.pureComputed" or "@kd.computed" to an accessor as follows.

    @kd.observable
    public firstName = "Vario";
    
    @kd.observable
    public lastName = "Try";
    
    @kd.pureComputed
    public get fullName() { return this.firstName + " " + this.lastName; }

You can use as writable computed if you define also setter.

#### Use `@extend` decorator

Attach "@kd.extend" to a property or accessor which is attached observable decorator as follows.

    @kd.pureComputed
    @kd.extend( { rateLimit: 500 } )
    public get fullName() { return this.firstName + " " + this.lastName; }

#### Added feature

Even though you declare as `x:number = 0`, the property type may become string type such as value is changed via input elements on browser.

In a case like that, use "@kd.asNumber" as follows.

    @kd.observable
    @kd.asNumber
    public x:number = 0

Thus, the property keep number type if set a value other than number type.

If the conveted value is NaN, the property is set zero.

### Get raw knockout observable object

You can get a knockout observable object by using below functions.

    getObservable<T>
    getObservableArray<T>
    getComputed<T>
    
Example of use.

    kd.getObservable<string>( this, "firstName" ).subscribe( newValue =>
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
