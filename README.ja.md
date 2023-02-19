# knockout-decorator について

[knockoutjs](https://github.com/knockout/knockout) を用いたプログラム作成を支援します。  

# 導入
1. 以下のパッケージを要求しています。
```json
{
  "devDependencies": {
    "typescript": ">=3.7.2",
    "knockout": ">=3.5.1",
    "vt-knockout-decorator": "2.0.1"
  }
}
```
2. tsconfig.json  
デコレータの利用には experimentalDecorators を true にする必要があります。    
また、useDefineForClassFields はデコレータとの相性が良くないので false を推奨します。
```json
{
  "compilerOptions": {
    "useDefineForClassFields": false,
    "experimentalDecorators": true
  }
}
```

3. サンプルコード
```typescript
import kd from "vt-knockout-decorator";
import * as ko from "knockout";

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

単純なinputTextプロパティの取得・設定がKnockoutJsと同様の挙動となります。

# リファレンス
```typescript
import kd from "vt-knockout-decorator";
```
と ショートネーム `kd` としてエイリアス設定しています。

## デコレータ
### クラス デコレータ
* [@track](#クラスデコレータ-track)
### プロパティ/アクセッサ デコレータ
* [@ignore](#プロパティ・アクセッサデコレータ-ignore)
* [@observable](#プロパティデコレータ-observable)
* [@observableArray](#プロパティデコレータ-observablearray)
* [@pureComputed](#アクセッサデコレータ-purecomputed)
* [@computed](#アクセッサデコレータ-computed)
* [@extend](#プロパティ・アクセッサデコレータ-extend)
### 値設定フィルタ
* [@setFilter](#setfilter)
* [@min](#min)
* [@max](#max)
* [@clamp](#clamp)
* [@asNumber](#asnumber)
## koObservableの取得関数
* [getObservable](#koobservable-の取得)
* [getObservableArray](#koobservable-の取得)
* [getComputed](#koobservable-の取得)

# 各デコレータ
## @track
クラスデコレータ  
`@track` は全てのプロパティ・アクセッサを observable/computed にします。
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
`@track`を使うにあたり注意点があります。  
1. 配列型プロパティをobservable arrayとして利用したい場合は、配列値で初期化して下さい。（例えば '[]' ）  
null | undefined で初期化されると、KnockoutObservableArray<T> ではなく、KnockoutObservable<T[]> 扱いとなります。
2. アクセッサは (pure) computed となります。
3. `@ignore`のあるプロパティ/アクセッサは observable/computed になりません。
4. コンストラクタが完了するまでは koObservable へのアクセスはできません。  
(例えば、kd.getObservable による koObservableの取得や、 ko.applyBindings を コンストラクタ内で実行しても期待通りに動きません)

`@track`は オプション kd.ITrackOptions を渡せます。
```typescript
    interface ITrackOptions
    {
        // アクセッサを pure computed にするかどうか(デフォルトtrue扱い)
        pureComputed?:boolean,
        // コンストラクタ実行直後に実行するメソッド名
        init?: string;
    }
```
init に関数名を指定すると、obj[init()] がコンストラクタ直後によばれます。  
ITrackOptions.init で実行されるメソッド内では、 koObservable が利用できます。  
その関数内では kd.getObservable()などを利用して 生のkoObservableにアクセスできます。

## @ignore
プロパティ・アクセッサデコレータ  
`@track`による observable/computed にするのを防ぎます。

## @observable
プロパティデコレータ  
プロパティを observableにします。
```typescript
class Sample
{
    @kd.observable
    name = "Vario";
}
```

## @observableArray
プロパティデコレータ  
プロパティを observable arrayにします。
```typescript
class Sample
{
    @kd.observableArray
    list : kd.IObservableArray<number> = [1,2,3] as any;
}
```
プロパティを `kd.IObservableArray<T>`として宣言すると、KnockoutObservableArray の関数（例えば removeやreplace）にアクセス可能です。

## @pureComputed
アクセッサデコレータ  
アクセッサを pure computed にします。
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
setterもある場合は、書き込み可能な computed となります。

## @computed
アクセッサデコレータ  
アクセッサを non pure computed にします。

## @extend
プロパティ・アクセッサデコレータ  
rateLimit のような ko.extend を設定します。
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

## 値設定フィルタについて
プロパティもしくはセッターに設定できます。(@kd.observable等と併用する必要があります)
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
設定フィルタデコレータが複数ある場合は、下から上の順序で実行されます。

### @setFilter
引数に ( setValue: any ) => any となる関数を渡します。  
setValueは外部からプロパティに設定される値が渡り、戻り値がプロパティに設定される値となります。  
`@kd.setFilter( v => v < 0 ? 0 : v )` の場合 0未満の値が代入されると、0の値がプロパティに設定されます。

### @min
`@kd.min(v)` で v以上となるよう値が設定されます。

### @max
`@kd.max(v)` で v以下の値となるよう設定されます。

### @clamp
`@kd.clamp(min,max)` で min以上、max以下となるよう値が設定されます。

### @asNumber
入力された値を数値型にします。  
`<input type="value" data-bind="value:x" />` など、ブラウザからの入力で文字列になる場合に役立ちます。

## koObservable の取得
以下の取得関数を使って、Knockout Observable のオブジェクトを取得できます。
* getObservable
* getObservableArray
* getComputed

取得例

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
