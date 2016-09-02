# knockout-decorator

���̃v���O�C���� knockout observable��p�����R�[�h�̋L�q���y�ɂ��܂��B

 [�f��](https://variotry.github.io/knockout-decorator/)���Q�Ƃ��Ă��������B(�u���E�U��es5���T�|�[�g���Ă���K�v������܂�)

## �g����

dist �f�B���N�g������ `js`, `d.ts` ��C�ӂ̏ꏊ�ɃR�s�[���Ahtml�Ɉȉ��̗l�ɋL�q���ĉ������B

    <script src="path/knockout.js"></script>
    <script src="path/knockout-decorator.min.js"></script>
	<script src="yourScript.js"></script>

������ `let kd = variotry.KnockoutDecorator` �悤�ɃV���[�g�l�[�����`���܂��B

### Decorators

* [`@track` and `@ignore`](#track-�f�R���[�^�[�̗��p)
* [`@observable`](#observable-�f�R���[�^�[�̗��p)
* [`@observableArray`](#observableArray-�f�R���[�^�[�̗��p)
* [`@pureComputed or @computed`](#purecomputed-computed-�f�R���[�^�[�̗��p)
* [`@extend`](#extend-�f�R���[�^�[�̗��p)
* [`@asNumber`](#�ǉ��@�\)

#### `@track` �f�R���[�^�[�̗��p

`@track` �f�R���[�^�[�͂��ׂẴv���p�e�B�E�A�N�Z�b�T�[��observable�ɂ��܂��B

�ȉ��̗l�ɃN���X�� `@track` ���A�^�b�`���Ă��������B

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

���̃R�[�h�͈ȉ��̃R�[�h�Ɠ��l�ł��B

    class Sample
    {
        private firstName = ko.observable("Vario");
        private lastName = ko.observable("Try");

        private name = ko.computed( () => this.firstName() + " " + this.lastName() );
    }

�����A�f�R���[�^�[�̓R�[�h���ȑf�����܂��B

�v���p�e�B�ɒl���Z�b�g����Ɓi�Ⴆ�� `this.firstName = "Bob"` �j�A�r���[���X�V����܂��B�t��������ł��B

�܂��Aname�Q�b�^�[�����s����܂��B

[demo1](https://variotry.github.io/knockout-decorator/)���Q�Ƃ��Ă��������B

`@track` �f�R���[�^�[�͒��ӎ���������܂��B

  1.observable�Ƃ��ĔF�������邽�߂ɁA�v���p�e�B�̐錾���A�������̓R���X�g���N�^�ŕϐ�������������K�v������܂��B(`null` ��ݒ肷��̂ł� OK �ł�)

    @kd.track
    class Sample1
    {
        private property1 : string = null;  // OK. observable�Ƃ��ĔF������܂�
        private property2 : string;         // NG. �v���p�e�B������������Ă��Ȃ����� observable�Ƃ��ĔF������܂���
        private property3 : string;         // OK. �R���X�g���N�^���ŏ���������Ă���̂� observable�Ƃ��ĔF������܂�

        public constructor()
        {
            this.property3 = "value";
        }
    }

  2.�z��v���p�e�B��observable array�Ƃ��ĔF��������ׂɂ́A�z��ŏ���������K�v������܂��Bnull �ŏ����������ꍇ�� KnockoutObservableArray&lt;T>�ł͂Ȃ��A KnockoutObservable&lt;T[]>�Ƃ��ĔF������܂��B

    @kd.track
    class Sample2
    {
        private array1 : string[] = [];     // KnockoutObservableArray<string> �Ƃ��ĔF������܂�
        private array2 : string[] = null;   // KnockoutObservable<string[]> �Ƃ��ĔF������܂�
    }

  3.�A�N�Z�b�T�[�� pure computed �Ƃ��ĔF������܂��B�ʏ�́i��pure�ȁj computed ���g�������ꍇ��, `@track`�̈����� { pureComputed:false } ��n�����A �A�N�Z�b�T�[��`@computed`���A�^�b�`���Ă��������B

    @kd.track
    class Sample3_1
    {
        private firstName = "Vario";
        private lastName = "Try";

        // pure computed �Ƃ��ĔF������܂�
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }

        // pure computed �Ƃ��ĔF������܂�
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

        // �i��pure) computed �Ƃ��ĔF������܂�
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }

        // �i��pure) computed �Ƃ��ĔF������܂�
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

        // �i��pure) computed �Ƃ��ĔF������܂�
        @computed
        private get name()
        {
            return this.firstName + " " + this.lastName;
        }

        // pure computed �Ƃ��ĔF������܂�
        private get name2()
        {
            return this.firstName + " " + this.lastName;
        }
    }



  4.�v���p�e�B��A�N�Z�b�T�[��observable�ɂ������Ȃ��ꍇ��, `@ignore` �f�R���[�^�[���A�^�b�`���Ă��������B [demo2](https://variotry.github.io/knockout-decorator/#demo2)���Q�Ƃ��Ă��������B

    @kd.track
    class Sample4
    {
        private firstName = "Vario";

        @kd.ignore
        private lastName = "Try";  // observable �Ƃ��ĔF������܂���B
    }

  5.�R���X�g���N�^���ł� observable�̎擾�E���p�͂ł��܂���B

    type IObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;

    // initializeMethod �I�v�V�����́A�R���X�g���N�^�I����Ɏ��s����郁�\�b�h���ƂȂ�܂��B
    @kd.track( {initializeMethod:"init"} )
    class Sample5
    {
        private property = "";
        private array = [] as IObservableArray<string>;

        public constructor()
        {
            let rawObservable = @kd.getObservable<string>( this, "property" );
            // rawObservable ��null�ƂȂ�܂�

            // Knockout Observable Array �̊֐��͌Ăׂ܂���B
            // this.array.remove( ... );
        }

        // init �̓R���X�g���N�^�̌�Ɏ��s����܂��B
        public init()
        {
            let rawObservable = @kd.getObservable<string>( this, "property" );
            // rawObservable �� ����observable object���Z�b�g����܂��B

            // Knockout Observable Array �̊֐����ĂԂ��Ƃ��ł��܂��B
            this.array.remove( ... );
        }
    }

#### `@observable` �f�R���[�^�[�̗��p

`@observable` �f�R���[�^�[�͌X�̃v���p�e�B�ɑ΂��� observable�ɕϊ����܂��B

�ȉ��̗l�Ƀv���p�e�B�� `@kd.observable` ���A�^�b�`���ĉ������B

    class Sample
    {
        @kd.observable
        public firstName = "Vario";    // observable�Ƃ��ĔF������܂��B

        public lastName = "Try";      // observable�Ƃ��ĔF������܂���B

        public constructor()
        {
            let rawObservable = @kd.getObservable<string>( this, "firstName" );
            // rawObservable �͐��� observable ���Z�b�g����܂��B
            // @track �f�R���[�^�[�Ƃ͈قȂ�A �R���X�g���N�^���� observable�̎擾�E���p���\�ł��B
        }
    }

### `@observableArray` �f�R���[�^�[�̗��p

`@observableArray` �f�R���[�^�[�͌X�̃v���p�e�B�ɑ΂��� observable array �ɕϊ����܂��B

�ȉ��̗l�ɔz��^�̃v���p�e�B�� "@kd.observableArray" ���A�^�b�`���Ă��������B

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ];

�v���p�e�B�ɐV�����z��f�[�^���Z�b�g( ��F `this.list = ["newData1", "newData2"]` )����ƁA�r���[���X�V����܂��B

push, pop �Ƃ����� Array �֐����ĂԂ� ( ��F `this.list.push("data4")`)�A�r���[���X�V����܂��B


�ȉ��Ɏ����悤�L���X�g���s���ƁA�C���e���Z���X�̓����� KnockoubObservableArray �̊֐��ɊȒP�ɃA�N�Z�X�ł��܂��B

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ] as IObservableArray<string>;
    
(IObservableArray&lt;T&gt; �� `type IObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;` �̂悤�ɃV���[�g�l�[����`���Ă��܂��j

### `@pureComputed`�A`@computed` �f�R���[�^�[�̗��p

`@pureComputed` �� `@computed` �f�R���[�^�[�͌X�̃A�N�Z�b�T�[�ɑ΂��� (pure) computed �ɕϊ����܂��B

�ȉ��̗l�ɃA�N�Z�b�T�� "@kd.pureComputed" �������� "@kd.computed" ���A�^�b�`���Ă��������B

    @kd.observable
    public firstName = "Vario";
    
    @kd.observable
    public lastName = "Try";
    
    @kd.pureComputed
    public get fullName() { return this.firstName + " " + this.lastName; }

setter ���p�ӂ��邱�Ƃŏ������݉\�� computed �Ƃ��ė��p�ł��܂��B

### `@extend` �f�R���[�^�[�̗��p

�ȉ��̗l�� observable �f�R���[�^���A�^�b�`�����v���p�e�B�� "@kd.extend" ���A�^�b�`���Ă�������

    @kd.pureComputed
    @kd.extend( { rateLimit: 500 } )
    public get fullName() { return this.firstName + " " + this.lastName; }

### �ǉ��@�\

`private x:number = 0` �̂悤�ɒ�`���Ă��A�u���E�U���input�v�f����Ēl��ύX����ȂǂŃv���p�e�B��string�^�ɂȂ�ꍇ������܂��B

���̂悤�ȏꍇ�͈ȉ��̂悤�� "@kd.asNumber" �𗘗p���Ă��������B

    @kd.observable
	@kd.asNumber
	private x:number = 0

�������邱�ƂŁAnumber�^�ȊO�̒l���Z�b�g���Ă��v���p�e�B��number�^��ۂ��܂��B

number�ւ̕ϊ���NaN�ɂȂ�ꍇ��0���Z�b�g����܂��B

### ���ƂȂ� knockout observable �I�u�W�F�N�g�̎擾

�ȉ��̊֐����g�����ŁAknockout observable �I�u�W�F�N�g���擾�ł��܂��B

    getObservable<T>
    getObservableArray<T>
    getComputed<T>

�g�p��F

    kd.getObservable<string>( this, "firstName" ).subscribe( newValue =>
    {
        console.log( "firstName value is", newValue );
    });

## �K�{�v��

knockout(http://knockoutjs.com/) 

tsConfig.json �� compilerOptions.experimentalDecorators �� true �ɃZ�b�g

es5 �T�|�[�g�u���E�U

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

## Author

[vario](https://github.com/variotry/)
