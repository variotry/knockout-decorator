# knockout-decorator

���̃v���O�C���� knockout observable��p�����R�[�h�̋L�q���y�ɂ��܂��B

## �f��

https://demo.variotry.com/knockoutDecorator/ �ɃA�N�Z�X���邩 demo/index.html ���Q�Ƃ��ĉ������B

�iGoogleChrome, IE11, Edge, firefox �Ŋm�F���Ă܂��B�j

demo/index.html ���Q�Ƃ���ۂ́A`npm install` �� `gulp install` �����s���Ă��������B
    
## �g����

dist �f�B���N�g������ js, d.ts ��C�ӂ̏ꏊ�ɃR�s�[���Ahtml�Ɉȉ��̗l�ɋL�q���ĉ������B

    <script src="path/knockout.js"></script>
    <script src="path/knockout-decorator.min.js"></script>
	<script src="yourScript.js"></script>

������ `var kd = variotry.KnockoutDecorator` �悤�ɃV���[�g�l�[�����`���܂��B

### 1.observable object �̗��p

�ȉ��̗l�Ƀv���p�e�B�� "@kd.observable" ���A�^�b�`���ĉ������B

    @kd.observable
    public firstName = "Bob";

���̃R�[�h�� `public firstName = ko.observable("Bob")` �Ɠ��l�ł��B

�v���p�e�B�ɒl���Z�b�g�i��F `this.firstName = "John"` �j����ƁA�r���[���X�V����܂��B
���̋t���R��ł��B


### 2.observable array �̗��p

�ȉ��̗l�ɔz��^�̃v���p�e�B�� "@kd.observableArray" ���A�^�b�`���Ă��������B

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ];

���̃R�[�h�� `public list = ko.observableArray([ "data1", "data2", "data3" ])` �Ɠ��l�ł��B

�v���p�e�B�ɐV�����z��f�[�^���Z�b�g( ��F `this.list = ["newData1", "newData2"]` )����ƁA�r���[���X�V����܂��B

push, pop �Ƃ����� Array �֐����ĂԂ� ( ��F `this.list.push("data4")`)�A�r���[���X�V����܂��B


�ȉ��Ɏ����悤�L���X�g���s���ƁA�C���e���Z���X�̓����� KnockoubObservableArray �̊֐��ɊȒP�ɃA�N�Z�X�ł��܂��B

    @kd.observableArray
    public list = [ "data1", "data2", "data3" ] as IObservableArray<string>;
    
(IObservableArray&lt;T&gt; �� `type IObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;` �̂悤�ɃV���[�g�l�[����`���Ă��܂��j

### 3.pureComputed�Acomputed �̗��p

�ȉ��̗l�ɃA�N�Z�b�T�� "@kd.pureComputed" �������� "@kd.computed" ���A�^�b�`���Ă��������B

    @kd.observable
    public firstName = "Bob";
    
    @kd.observable
    public lastName = "Smith";
    
    @kd.pureComputed
    public get fullName() { return this.firstName + " " + this.lastName; }


���̃R�[�h�� `public firstName  = ko.pureComputed( () => this.firstName + " " + this.lastName )` �Ɠ��l�ł��B

firstName �������� lastName ���ύX�����ƁAfullName�Q�b�^�[���Ă΂�܂��B

�Ȃ��Asetter ���p�ӂ��邱�Ƃŏ������݉\�� computed �Ƃ��ė��p�ł��܂��B

### 4.extenders �̗��p

�ȉ��̗l�� observable �f�R���[�^���A�^�b�`�����v���p�e�B�� "@kd.extend" ���A�^�b�`���Ă�������

    @kd.pureComputed
    @kd.extend( { rateLimit: 500 } )
    public get fullName() { return this.firstName + " " + this.lastName; }

���̃R�[�h�� `public firstName  = ko.pureComputed( () => this.firstName + " " + this.lastName ).extend( { rateLimit:500 } )` �Ɠ��l�ł��B

### 5.�ǉ��@�\

`private x:number = 0` �̂悤�ɒ�`���Ă��A�u���E�U���input�v�f����Ēl��ύX����ȂǂŃv���p�e�B��string�^�ɂȂ�ꍇ������܂��B

���̂悤�ȏꍇ�͈ȉ��̂悤�� "@kd.asNumber" �𗘗p���Ă��������B

    @kd.observable
	@kd.asNumber
	private x:number = 0

�������邱�ƂŁAnumber�^�ȊO�̒l���Z�b�g���Ă��v���p�e�B��number�^��ۂ��܂��B

number�ւ̕ϊ���NaN�ɂȂ�ꍇ��0�Ƃ��Ĉ����܂��B

### 6.���ƂȂ� knockout observable �I�u�W�F�N�g�̎擾

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
