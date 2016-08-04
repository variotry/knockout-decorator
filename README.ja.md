# knockout-decorator

このプラグインは knockout observableを用いたコードの記述を楽にします。

## デモ

https://demo.variotry.com/knockoutDecorator/ にアクセスするか demo/index.html を参照して下さい。

（GoogleChrome, IE11, Edge, firefox で確認してます。）

demo/index.html を参照する際は、`npm install` と `gulp install` を実行してください。
    
## 使い方

dist ディレクトリ内の js, d.ts を任意の場所にコピーし、htmlに以下の様に記述して下さい。

    <script src="path/knockout.js"></script>
    <script src="path/knockout-decorator.min.js"></script>
	<script src="yourScript.js"></script>

そして `var kd = variotry.KnockoutDecorator` ようにショートネームを定義します。

### 1.observable object の利用

以下の様にプロパティに "@kd.observable" をアタッチして下さい。

    @kd.observable
    public firstName = "Bob";

このコードは `public firstName = ko.observable("Bob")` と同様です。

プロパティに値をセット（例： `this.firstName = "John"` ）すると、ビューも更新されます。
その逆も然りです。


### 2.observable array の利用

以下の様に配列型のプロパティに "@kd.observableArray" をアタッチしてください。

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ];

このコードは `public list = ko.observableArray([ "data1", "data2", "data3" ])` と同様です。

プロパティに新しい配列データをセット( 例： `this.list = ["newData1", "newData2"]` )すると、ビューも更新されます。

push, pop といった Array 関数を呼ぶと ( 例： `this.list.push("data4")`)、ビューも更新されます。


以下に示すようキャストを行うと、インテリセンスの働きで KnockoubObservableArray の関数に簡単にアクセスできます。

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ] as IObservableArray<string>;
    
(IObservableArray&lt;T&gt; は `type IObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;` のようにショートネーム定義しています）

### 3.pureComputed、computed の利用

以下の様にアクセッサに "@kd.pureComputed" もしくは "@kd.computed" をアタッチしてください。

    @kd.observable
    public firstName = "Bob";
    
    @kd.observable
    public lastName = "Smith";
    
    @kd.pureComputed
    public get fullName() { return this.firstName + " " + this.lastName; }


このコードは `public firstName  = ko.pureComputed( () => this.firstName + " " + this.lastName )` と同様です。

firstName もしくは lastName が変更されると、fullNameゲッターが呼ばれます。

なお、setter も用意することで書き込み可能な computed として利用できます。

### 4.extenders の利用

以下の様に observable デコレータをアタッチしたプロパティに "@kd.extend" をアタッチしてください

    @kd.pureComputed
    @kd.extend( { rateLimit: 500 } )
    public get fullName() { return this.firstName + " " + this.lastName; }

このコードは `public firstName  = ko.pureComputed( () => this.firstName + " " + this.lastName ).extend( { rateLimit:500 } )` と同様です。

### 5.追加機能

`private x:number = 0` のように定義しても、ブラウザ上のinput要素を介して値を変更するなどでプロパティがstring型になる場合があります。

そのような場合は以下のように "@kd.asNumber" を利用してください。

    @kd.observable
	@kd.asNumber
	private x:number = 0

こうすることで、number型以外の値をセットしてもプロパティはnumber型を保ちます。

numberへの変換でNaNになる場合は0として扱います。

### 6.元となる knockout observable オブジェクトの取得

以下の関数を使う事で、knockout observable オブジェクトを取得できます。

    getObservable<T>
    getObservableArray<T>
    getComputed<T>

使用例：

    kd.getObservable<string>( this, "firstName" ).subscribe( newValue =>
    {
        console.log( "firstName value is", newValue );
    });

## 必須要件

knockout(http://knockoutjs.com/) 

tsConfig.json の compilerOptions.experimentalDecorators を true にセット

es5 サポートブラウザ

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

## Author

[vario](https://github.com/variotry/)
