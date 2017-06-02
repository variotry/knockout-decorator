# Abount knockout-decorator

This plug-in will assist you write code using [knockoutjs](https://github.com/knockout/knockout).  

# Introduction
## For use as import of module.
1. Install package by using npm.
```npm
    npm install knockout @types/knockout vt-knockout-decorator --dev-save
```
2. Import module in a TypeScript code.
```typescript
    import kd from "vt-knockout-decorator";
```

3. Write in as follows into a html.
```html
<script src="path/knockout.js"></script>
<script src="path/bundle.js"></script>
<script src="yourScript.js"></script>
```
If you bundle knockoutjs into a js, define global variable `ko` as follows.
```typescript
import * as ko from "knockout";
(<any>window).ko = ko;
```

## For use in global scope.
1. Copy `dist/knockout-decorator.min.js` and `dist-globalDefinition/knockout-decorator.d.ts` in a your project directory.
2. Write a TypeScript code.
```typescript
///<reference path="path/knockout-decorator.d.ts" />
import kd = KnockoutDecorator;  // not module import but set as alias
```
3. Write a html.
```html
<script src="path/knockout.js"></script>
<script src="path/knockout-decorator.min.js"></script>
<script src="yourScript.js"></script>
```

# Reference
We access decorators etc via alias `kd` in this section.

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

## class decorator @track
`@track` make all properties/accessors observable/computed.
```typescript
@kd.track
class Sample
{
    firstName = "Vario";
    lastName = "Try";
        
    get name()
    {
        return this.firstName + " " + this.lastName;
    }
}
```
Points to consider when using @`track`.
1. Properties that are not initialized at declare or in constructor don't make observable.
2. In order to recognize a array property as observable array, it is necessary to set a array value first(e.g set [] ).  
If you set null as initial value, the property make not KnockoutObservableArray<T> but KnockoutObservable<T[]>.
3. Accessors make pure computed.
4. Properties/Accessors with `@ignore` don't make observable.
5. In order to use raw koObservable, it is necessary to be completion of a constructor execution.  
(For example, you can't get raw koObservable by using kd.getObservable and ko.applyBindings does not work as expected in constructor.)

You can passed kd.ITracOptions to `@track`.
```typescript
    interface ITrackOptions
    {
        // Make accessors pure computed if true or undefined, else non pure computed.
        pureComputed?:boolean,
        // If value set, execute obj[init]() immediate after executed constructor.
        init?: string;
    }
```
Within the method specified in ITrackOptions.init you can get raw koObservable.  
(You can get raw koObservable by using kd.getObservable and ko.applyBindings works as expected.)

## Property/Accessor decorator @ignore
Prevent a property/accessor from making observable in `@track` class.

## Property decorator @observable
Make a property observable.
```typescript
class Sample
{
    @kd.observable
    name = "Vario";
}
```

## Property decorator @observableArray
Make a property observable array.
```typescript
class Sample
{
    @kd.observableArray
    list = [1,2,3] as kd.IObservableArray<number>;
}
```
If you cast Array to `kd.IObservableArray<T>`, you can direct execute functions of KnockoutObservableArray(e.g. remove or replace).

## Accessor decorator @pureComputed
Make a accessor pure computed.
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
If setter is defined, make it writable computed.

## Accessor decorator @computed
Make a accessor non pure computed.

## Property/Accessor decorator @extend
Set ko.extenders for observable.( e.g. `rateLimit`)
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
    @kd.setFilter( v => v > 100 ? 100 : v ) // equal to @kd.max( 100 )
    @kd.setFilter( v => v < 0 ? 0 : v ) // equal to @kd.min( 0 )
    x = 10;
}
```
If set multiple filter decorators, there are executed in the order from bottom to top.

### @setFilter
Passing "( setValue: any ) => any" function.  
`setValue` of argument is value passed from outside or value of other filter result.
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
It is useful if type of a property value is converted "string type" by input via view by binding input text such as `<input type="value" data-bind="value:x" />`.

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
    list = [1,2,3];
        
    get name()
    {
        return this.firstName + " " + this.lastName;
    }

    init()
    {
        // get raw koObservable of firstName .
        let rawObservable = kd.getObservable( ()=> this.firstName );
        // You can get raw koObservable by kd.getObservable( this, "firstName" ) also.;
        rawObservable.subscribe( v =>
		{
			console.log( "value changed" );
		} );

        let rawObservableArray = kd.getObservableArray( ()=> this.list );
        let rawComputed = kd.getComputed( ()=> this.name );
    }
}
```

## Requirement
knockout(http://knockoutjs.com/)  
tsConfig.json compilerOptions.experimentalDecorators set true  
es5 support browser

## License
MIT (http://www.opensource.org/licenses/mit-license.php)

## Author
[vario](https://github.com/variotry/)
