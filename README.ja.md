# knockout-decorator

このプラグインは knockout observableを用いたコードの記述を楽にします。

 [デモ](https://variotry.github.io/knockout-decorator/)を参照してください。(ブラウザはes5をサポートしている必要があります)

## 使い方

`dist/knockout-decorator.min.js`、 `dist-globalDefinition/knockout-decorator.d.ts` を任意の場所にコピーし、htmlに以下の様に記述して下さい。

    <script src="path/knockout.js"></script>
    <script src="path/knockout-decorator.min.js"></script>
	<script src="yourScript.js"></script>

そして `import kd = KnockoutDecorator` ようにショートネームを定義します。

### Decorators

* [`@track` and `@ignore`](#track-デコレーターの利用)
* [`@observable`](#observable-デコレーターの利用)
* [`@observableArray`](#observablearray-デコレーターの利用)
* [`@pureComputed or @computed`](#purecomputedcomputed-デコレーターの利用)
* [`@extend`](#extend-デコレーターの利用)
* [`@asNumber`](#追加機能)

#### `@track` デコレーターの利用

`@track` デコレーターはすべてのプロパティ・アクセッサーをobservableにします。

以下の様にクラスに `@track` をアタッチしてください。

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

このコードは以下のコードと同様です。

    class Sample
    {
        private firstName = ko.observable("Vario");
        private lastName = ko.observable("Try");

        private name = ko.computed( () => this.firstName() + " " + this.lastName() );
    }

ただ、デコレーターはコードを簡素化します。

プロパティに値をセットすると（例えば `this.firstName = "Bob"` ）、ビューが更新されます。逆もしかりです。

また、nameゲッターも実行されます。

[demo1](https://variotry.github.io/knockout-decorator/)を参照してください。

`@track` デコレーターは注意事項があります。

  1.observableとして認識させるために、プロパティの宣言時、もしくはコンストラクタで変数を初期化する必要があります。(`null` を設定するのでも OK です)

    @kd.track
    class Sample1
    {
        private property1 : string = null;  // OK. observableとして認識されます
        private property2 : string;         // NG. プロパティが初期化されていないため observableとして認識されません
        private property3 : string;         // OK. コンストラクタ内で初期化されているので observableとして認識されます

        public constructor()
        {
            this.property3 = "value";
        }
    }

  2.配列プロパティをobservable arrayとして認識させる為には、配列で初期化する必要があります。null で初期化した場合は KnockoutObservableArray&lt;T>ではなく、 KnockoutObservable&lt;T[]>として認識されます。

    @kd.track
    class Sample2
    {
        private array1 : string[] = [];     // KnockoutObservableArray<string> として認識されます
        private array2 : string[] = null;   // KnockoutObservable<string[]> として認識されます
    }

  3.アクセッサーは pure computed として認識されます。通常の（非pureな） computed を使いたい場合は, `@track`の引数に { pureComputed:false } を渡すか、 アクセッサーに`@computed`をアタッチしてください。

    @kd.track
    class Sample3_1
    {
        private firstName = "Vario";
        private lastName = "Try";

        // pure computed として認識されます
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }

        // pure computed として認識されます
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

        // （非pure) computed として認識されます
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }

        // （非pure) computed として認識されます
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

        // （非pure) computed として認識されます
        @computed
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }

        // pure computed として認識されます
        private get name2()
        {
            return this.firstName + " " + this.lastName;
        }
    }



  4.プロパティやアクセッサーをobservableにしたくない場合は, `@ignore` デコレーターをアタッチしてください。 [demo2](https://variotry.github.io/knockout-decorator/#demo2)を参照してください。

    @kd.track
    class Sample4
    {
        private firstName = "Vario";

        @kd.ignore
        private lastName = "Try";  // observable として認識されません。
    }

  5.コンストラクタ内では observableの取得・利用はできません。

    // initializeMethod オプションは、コンストラクタ終了後に実行されるメソッド名となります。
    @kd.track( {initializeMethod:"init"} )
    class Sample5
    {
        private property = "";
        private array = [] as kd.IObservableArray<string>;

        public constructor()
        {
            let rawObservable = @kd.getObservable<string>( this, "property" );
            // rawObservable はnullとなります

            // Knockout Observable Array の関数は呼べません。
            // this.array.remove( ... );
        }

        // init はコンストラクタの後に実行されます。
        public init()
        {
            let rawObservable = @kd.getObservable<string>( this, "property" );
            // rawObservable は 生のobservable objectがセットされます。

            // Knockout Observable Array の関数を呼ぶことができます。
            this.array.remove( ... );
        }
    }

#### `@observable` デコレーターの利用

`@observable` デコレーターは個々のプロパティに対して observableに変換します。

以下の様にプロパティに `@kd.observable` をアタッチして下さい。

    class Sample
    {
        @kd.observable
        public firstName = "Vario";    // observableとして認識されます。

        public lastName = "Try";      // observableとして認識されません。

        public constructor()
        {
            let rawObservable = @kd.getObservable<string>( this, "firstName" );
            // rawObservable は生の observable がセットされます。
            // @track デコレーターとは異なり、 コンストラクタ内で observableの取得・利用が可能です。
        }
    }

#### `@observableArray` デコレーターの利用

`@observableArray` デコレーターは個々のプロパティに対して observable array に変換します。

以下の様に配列型のプロパティに "@kd.observableArray" をアタッチしてください。

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ];

プロパティに新しい配列データをセット( 例： `this.list = ["newData1", "newData2"]` )すると、ビューも更新されます。

push, pop といった Array 関数を呼ぶと ( 例： `this.list.push("data4")`)、ビューも更新されます。


以下に示すようキャストを行うと、インテリセンスの働きで KnockoubObservableArray の関数に簡単にアクセスできます。

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ] as kd.IObservableArray<string>;

#### `@pureComputed`、`@computed` デコレーターの利用

`@pureComputed` と `@computed` デコレーターは個々のアクセッサーに対して (pure) computed に変換します。

以下の様にアクセッサに "@kd.pureComputed" もしくは "@kd.computed" をアタッチしてください。

    @kd.observable
    public firstName = "Vario";
    
    @kd.observable
    public lastName = "Try";
    
    @kd.pureComputed
    public get fullName() { return this.firstName + " " + this.lastName; }

setter も用意することで書き込み可能な computed として利用できます。

#### `@extend` デコレーターの利用

以下の様に observable デコレータをアタッチしたプロパティに "@kd.extend" をアタッチしてください

    @kd.pureComputed
    @kd.extend( { rateLimit: 500 } )
    public get fullName() { return this.firstName + " " + this.lastName; }

#### 追加機能

`private x:number = 0` のように定義しても、ブラウザ上のinput要素を介して値を変更するなどでプロパティがstring型になる場合があります。

そのような場合は以下のように "@kd.asNumber" を利用してください。

    @kd.observable
	@kd.asNumber
	private x:number = 0

こうすることで、number型以外の値をセットしてもプロパティはnumber型を保ちます。

numberへの変換でNaNになる場合は0がセットされます。

### 元となる knockout observable オブジェクトの取得

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
