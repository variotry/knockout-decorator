# knockout-decorator

���̃v���O�C���͕��i�ʂ�Ƀv���p�e�B�������Ȃ炪�� Knockout observable �̋@�\��񋟂��܂��B

## �C���X�g�[��

html�Ɉȉ��̗l�ɋL�q���ĉ������B

    <script src="path/knockout.js"></script>
    <script src="path/knockout-decorator.js"></script>
    
## �g����

�ŏ��� `var vt = variotry.KnockoutDecorator` �悤�ɃV���[�g�l�[�����`���܂��B

### 1.observable object �̗��p

�ȉ��̗l�Ƀv���p�e�B�� "@vt.observable" ���A�^�b�`���ĉ������B

    @vt.observable
    public firstName = "Bob";

���̃R�[�h�� `public firstName = ko.observable("Bob")` �Ɠ��l�ł��B

�������A�v���p�e�B�ɃA�N�Z�X����ۂɊ���'()'�������K�v������܂���B

�v���p�e�B�ɒl���Z�b�g�i��F `this.firstName = "John"` �j����ƁA�r���[���X�V����܂��B
���̋t���R��ł��B


### 2.observable array �̗��p

�ȉ��̗l�ɔz��^�̃v���p�e�B�� "@vt.observableArray" ���A�^�b�`���Ă��������B

    @vt.observableArray
    public list = [ "data1", "data2", "data3" ];

���̃R�[�h�� `public list = ko.observableArray([ "data1", "data2", "data3" ])` �Ɠ��l�ł��B

�v���p�e�B�ɐV�����z��f�[�^���Z�b�g( ��F `this.list = ["newData1", "newData2"]` )����ƁA�r���[���X�V����܂��B

push, pop �Ƃ����� Array �֐����ĂԂ� ( ��F `this.list.push("data4")`)�A�r���[���X�V����܂��B


�ȉ��Ɏ����悤�L���X�g���s���ƁA�C���e���Z���X�̓����� KnockoubObservableArray �̊֐��ɊȒP�ɃA�N�Z�X�ł��܂��B

    @vt.observableArray
    public list = [ "data1", "data2", "data3" ] as IObservableArray<string>;
    
(IObservableArray&lt;T&gt; �� `type IObservableArray<T> = variotry.KnockoutDecorator.IObservableArray<T>;` �̂悤�ɃV���[�g�l�[����`���܂����j

### 3.pureComputed�Acomputed �̗��p

�ȉ��̗l�ɃA�N�Z�b�T�� "@vt.pureComputed" �������� "@vt.computed" ���A�^�b�`���Ă��������B

    @vt.observable
    public firstName = "Bob";
    
    @vt.observable
    public lastName = "Smith";
    
    @vt.pureComputed
    public get fullName() { return this.firstName + " " + this.lastName; }


���̃R�[�h�� `public firstName  = ko.pureComputed( () => this.firstName + " " + this.lastName )` �Ɠ��l�ł��B

firstName �������� lastName ���ύX�����ƁAfullName�Q�b�^�[���Ă΂�܂��B

�Ȃ��Asetter ���p�ӂ��邱�Ƃŏ������݉\�� computed �Ƃ��ė��p�ł��܂��B

### 4.extenders �̗��p

�ȉ��̗l�� observable �f�R���[�^���A�^�b�`�����v���p�e�B�� "@vt.extend" ���A�^�b�`���Ă�������

    @vt.pureComputed
    @vt.extend( { rateLimit: 500 } )
    public get fullName() { return this.firstName + " " + this.lastName; }

���̃R�[�h�� `public firstName  = ko.pureComputed( () => this.firstName + " " + this.lastName ).extend( { rateLimit:500 } )` �Ɠ��l�ł��B

### 5.���ƂȂ� knockout observable �I�u�W�F�N�g�̎擾

�ȉ��̊֐����g�����ŁAknockout observable �I�u�W�F�N�g���擾�ł��܂��B

    getObservable<T>
    getObservableArray<T>
    getComputed<T>

�g�p��F

    getObservable<string>( this, "firstName" ).subscribe( newValue =>
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
