# knockout-decorator について

[knockoutjs](https://github.com/knockout/knockout) を用いるプログラム作成を支援します。  

# 導入
## モジュールとしてインポートする
1. npm install でパッケージをインストール
```npm
    npm install knockout @types/knockout vt-knockout-decorator --dev-save
```
2. TypeScriptコードでモジュールをインポート
```typescript
    import kd from "vt-knockout-decorator";
```

3. html側でknockout.jsを読み込むよう記述
```html
<script src="path/knockout.js"></script>
<script src="path/bundle.js"></script>
<script src="yourScript.js"></script>
```
bundle.js に knockoutjs を含める場合は
```typescript
import * as ko from "knockout";
(<any>window).ko = ko;
```
のように、グローバル変数 ko を設定してください。 

## ライブラリをグローバルに置く場合
1. `dist/knockout-decorator.min.js`, `dist-globalDefinition/knockout-decorator.d.ts` をプロジェクトディレクトリにコピー  
2. TypeScriptコードに記述
```typescript
///<reference path="path/knockout-decorator.d.ts" />
import kd = KnockoutDecorator;  // モジュールのインポートではなくaliasとして設定
```
3. htmlに記述
```html
<script src="path/knockout.js"></script>
<script src="path/knockout-decorator.min.js"></script>
<script src="yourScript.js"></script>
```

# リファレンス

ここでの説明では、エイリアス `kd` を通してデコレーター等にアクセスします。

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

## クラスデコレータ @track
`@track` は全てのプロパティ・アクセッサを observable/computed にします。
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
`@track`を使うにあたり注意点があります。  
1. 宣言もしくはコンストラクタ内で初期化されていないプロパティは observable になりません。  
2. 配列型プロパティをobservable arrayとして利用したい場合は、配列値で初期化して下さい。（例えば '[]' ）
nullで初期化すると、KnockoutObservableArray<T> ではなく、KnockoutObservable<T[]> となります。
3. アクセッサは pure computed となります。
4. `@ignore`のあるプロパティ/アクセッサは observable/computed になりません。
5. コンストラクタの実行が完了するまでは koObservable は利用できません。  
(例えば、kd.getObservable による koObservableの取得や、 ko.applyBindings を コンストラクタ内で実行しても期待通りに動きません)

`@track`は オプション kd.ITrackOptions を渡せます。
```typescript
    interface ITrackOptions
    {
        // アクセッサを pure computed にするかどうか(デフォルトtrue)
        pureComputed?:boolean,
        // コンストラクタ実行直後に実行するメソッド名
        init?: string;
    }
```
ITrackOptions.init で実行されるメソッド内では、 koObservable が利用できます。  
(kd.getObservable による koObservableの取得や、 ko.applyBindings が期待通りに動作します)

## プロパティ・アクセッサデコレータ @ignore
`@track`による observable/computed にするのを無視します。

## プロパティデコレータ @observable
プロパティを observableにします。
```typescript
class Sample
{
    @kd.observable
    name = "Vario";
}
```

## プロパティデコレータ @observableArray
プロパティを observable arrayにします。
```typescript
class Sample
{
    @kd.observableArray
    list = [1,2,3] as kd.IObservableArray<number>;
}
```
配列プロパティを `kd.IObservableArray<T>`にキャストすると、KnockoutObservableArray の関数（例えば removeやreplace）を直接呼ぶことができます。

## アクセッサデコレータ @pureComputed
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

## アクセッサデコレータ @computed
アクセッサを non pure computed にします。

## プロパティ・アクセッサデコレータ @extend
rateLimit のような ko.extenders を設定します。
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
プロパティもしくはセッターに設定できます。(@observable等が適用されている必要があります)
```typescript
class Sample
{
    @kd.observable
    @kd.setFilter( v => v > 100 ? 100 : v ) // equal @kd.max( 100 )
    @kd.setFilter( v => v < 0 ? 0 : v ) // equal @kd.min( 0 )
    x = 10;
}
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

## 必須要件
* knockout(http://knockoutjs.com/) 
* tsConfig.json の compilerOptions.experimentalDecorators を true にセット
* es5 サポートブラウザ

## License
MIT (http://www.opensource.org/licenses/mit-license.php)

## Author
[vario](https://github.com/variotry/)
