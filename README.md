# Abount knockout-decorator

This plug-in will assist you write code using [knockoutjs](https://github.com/knockout/knockout).  

# Introduction
1. Require follow packages.
```json
{
  "devDependencies": {
    "typescript": ">=3.7.2",
    "knockout": ">=3.5.1",
    "@types/knockout": ">=3.4.72"
    "vt-knockout-decorator": "2.0.0"
  }
}
```
2. tsconfig.json  
experimentalDecorators must be true to use decorator.  
And, useDefineForClassFields is not compatible with decorator, so it recommend set to false. 
```json
{
  "compilerOptions": {
    "useDefineForClassFields": false,
    "experimentalDecorators": true
  }
}
```

3. Sample Code
```typescript
import { KnockoutDecorator as kd } from "vt-knockout-decorator";
import * as ko from "knockout";
( <any>window ).ko = ko;

class Sample
{
    @kd.observable
    private inputText: string;

    public constructor()
    {
        ko.applyBindings( this, document.body );
    }

    public getText(): string
    {
        return this.inputText;
    }

    public changeText( s: string ): void
    {
        this.inputText = s;
    }
}

let sample = new Sample();
sample.changeText( 'hoge' );
```
```html
<!-- html view -->
<body>
    <input type="text" data-bind="value:inputText">
</body>
```

Getting/Setting of simple inputText property behaves like KnockoutJs.

# Reference
```typescript
import { KnockoutDecorator as kd } from "vt-knockout-decorator";
```
set alias as short name `kd`.


## Decorators
### Class decorator
* [@track](#class-decorator-track)
### Property/Accessor decorators
* [@ignore](#propertyaccessor-decorator-ignore)
* [@observable](#property-decorator-observable)
* [@observableArray](#property-decorator-observablearray)
* [@pureComputed](#accessor-decorator-purecomputed)
* [@computed](#accessor-decorator-computed)
* [@extend](#propertyaccessor-decorator-extend)
### Value set filters
* [@setFilter](#setfilter)
* [@min](#min)
* [@max](#max)
* [@clamp](#clamp)
* [@asNumber](#asnumber)
##  get raw koObservable methods
* [getObservable](#get-raw-koobservable)
* [getObservableArray](#get-raw-koobservable)
* [getComputed](#get-raw-koobservable)

# Each decorators
## @track
class decorator  
`@track` become all properties/accessors Observable/Computed.
```typescript
@kd.track
class Sample
{
    firstName : string = "Vario";    // observable
    lastName : string = "Try";       // observable

    arr :kd.IObservableArray<string> = [] as any;   // observable array

    @kd.ignore
    ignoreVal : number; // no observable

    get name()  // computed
    {
        return this.firstName + " " + this.lastName;
    }
}
```
Points to consider.
1. In order to use an array property as ObservableArray, it is necessary to set an array value(e.g. []) when declare the property or inside constructor.
2. Accessors become (Pure) Computed.
3. A property/accessor with `@ignore` decorator don't become Observable.
4. It is impossible to access Raw koObservables until the constructor has completed.

You can pass kd.ITracOptions to `@track`.
```typescript
    interface ITrackOptions
    {
        // Become accessors pure computed if true or undefined, else non-pure computed.
        pureComputed?:boolean,
        // If value set, perform obj[init]() immediate after constructor.
        // It is possible to access raw koObservables using getObservable() etc.
        init?: string;
    }
```

## @ignore
Property/Accessor decorator  
Prevent a property/accessor from becoming observable in `@track` class.

## @observable
Property decorator  
A property become koObservable.
```typescript
class Sample
{
    @kd.observable
    name = "Vario";
}
```

## @observableArray
Property decorator  
A property become koObservableArray.
```typescript
class Sample
{
    @kd.observableArray
    list : kd.IObservableArray<number> = [1,2,3] as any;
}
```
If you specify `kd.IObservableArray<T>` type for a property, you can easily access methods (e.g. remove, replace etc.) defined on Knockout ObservableArray.

## @pureComputed
Accessor decorator  
At least require getter. (Not allow setter only)  
An accessor become koPureComputed. If setter is defined, make it writable computed.
```typescript
class Sample
{
    @kd.observable
    firstName = "Vario";
    @kd.observable
    lastName = "Try";
        
    @kd.pureComputed
    get name()
    {
        return this.firstName + " " + this.lastName;
    }
}
```

## @computed
Accessor decorator  
Make a accessor non-pure computed.

## @extend
Property/Accessor decorator  
Set ko.extend for a observable.( e.g. `rateLimit`)
```typescript
class Sample
{
    @kd.observable
    firstName = "Vario";
    @kd.observable
    lastName = "Try";

    @kd.pureComputed
    @kd.extend( { rateLimit: 10 } )
    get name()
    {
        return this.firstName + " " + this.lastName;
    }
}
```

## About Value set filters
Value set filter decorators can be set to Properties/Setters.(`@observable` etc must be set)
```typescript
class Sample
{
    @kd.observable
    @kd.setFilter( v => v > 100 ? 100 : v ) // equal @kd.max( 100 )
    @kd.setFilter( v => v < 0 ? 0 : v ) // equal @kd.min( 0 )
    x;
}
let s = new Sample();
s.x = 10;       // <- x is 10
s.x = 150;      // <- x is 100
s.x = -100;     // <- x is 0
```
If set multiple filter decorators, they are executed in the order from bottom to top.

### @setFilter
Passing "( setValue: any ) => any" function.  
`setValue` is value passed from outside or value of other set filter result.
Finally, set a property to last filter result value.  
For example, In the case of `@kd.setFilter( v => v < 0 ? 0 : v )`, set a property to zero if substitute less than zero for it.

### @min
In the case of `@kd.min(v)`, set a property to equal or grater than v.

### @max
In the case of `@kd.max(v)`, set a property to equal or less than v.

### @clamp
In the case of `@kd.clamp(v)`, set a property to within min and max range.

### @asNumber
Input value keep numerical type.(No argument)  
It is enabled to prevent convert to string type from via view such as `<input type="value" data-bind="value:x" />`

## Get raw koObservable
You can get raw koObservable object by using follows methods.
* getObservable
* getObservableArray
* getComputed

Example of get.
```typescript
@kd.track( { init: 'init' } )
class Sample
{
    firstName = "Vario";
    lastName = "Try";
    list = [ 1, 2, 3 ];

    get name()
    {
        return this.firstName + " " + this.lastName;
    }

    constructor()
    {
        // Note.
        // It is impossible to access raw koObservable inside constructor of @track class 
    }

    init()
    {
        // get raw koObservable of firstName .
        let rawObservable = kd.getObservable( () => this.firstName );
        // You can get raw koObservable by kd.getObservable( this, "firstName" ) also.;
        rawObservable.subscribe( v => {
            console.log( "value changed" );
        } );

        let rawObservableArray = kd.getObservableArray( () => this.list );
        let rawComputed = kd.getComputed( () => this.name );
    }
}
```


## License
MIT (http://www.opensource.org/licenses/mit-license.php)

## Author
[vario](https://github.com/variotry/)
