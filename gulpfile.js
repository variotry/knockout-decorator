
let gulp = require( "gulp" ),
	gutil = require( "gulp-util" ),
	uglify = require( "gulp-uglify" ),
	plumber = require( "gulp-plumber" ),
	typings = require( "gulp-typings" ),
	rename = require( "gulp-rename" ),
	sourcemaps = require( "gulp-sourcemaps" ),
	sequence = require( "run-sequence" ),
	typescript = require( "gulp-typescript" ),
	sass = require( "gulp-sass" ),
	bower = require( "gulp-bower" ),
	typedoc = require( "gulp-typedoc" )
	merge2 = require( "merge2" );

gulp.task( "build:ts", () =>
{
	return buildTypeScript( "ts/**/*.ts", "js" );
} );

gulp.task( "watch:ts", ["build:ts"], () =>
{
	return gulp.watch( "ts/**/*.ts", ["build:ts"] );
} );

gulp.task( "build:sass", ()=>
{
	return gulp.src( "sass/**/*.scss" )
			.pipe( plumber() )
			.pipe( sass() )
			.pipe( gulp.dest( "stylesheets" ) );
} )
gulp.task( "watch:sass", ["build:sass"], () =>
{
	return gulp.watch( "sass/**/*.scss", ["build:sass"] );
} );


gulp.task( "install:bower", () =>
{
	let bowerDir = "bower_components";
	gulp.task( "_install:bower", () => bower( bowerDir ) );
	gulp.task( "_move:knockout", () =>
	{
		return gulp.src( bowerDir + "/knockout/dist/knockout.js" )
			.pipe( gulp.dest( "js" ) );
	} );
	gulp.task( "_move:knockout-decorator", () =>
	{
		return gulp.src( bowerDir + "/knockout-decorator/dist/**/*" )
			.pipe( gulp.dest( "js" ) );
	} );
	
	return sequence( "_install:bower", ["_move:knockout", "_move:knockout-decorator"] );
} );

gulp.task( "install:typings", () =>
{
	return gulp.src( "./typings.json" )
			.pipe(typings());
} );

gulp.task( "install", () =>
{
	return sequence( ["install:bower", "install:typings"], ["build:ts", "build:sass"] )
});

function buildTypeScript( src, dest, options )
{
	options = options || {};

	let config = require( "./tsconfig.json" );
	if ( Array.isArray( src ) === false )
	{
		src = [src];
	}
	
	let stream = gulp.src( src.concat( ["typings/index.d.ts", "js/knockout-decorator.d.ts"] ) )
		.pipe( plumber() )
		.pipe( options.sourceMap ? sourcemaps.init() : gutil.noop() )
		.pipe( typescript( config.compilerOptions ) );
		
	let restTasks = [
		stream.pipe( uglify( {
			preserveComments: "some"
		} ) )
			.pipe( rename( { extname: ".min.js" } ) )
			.pipe( options.sourceMap ? sourcemaps.write( "../sourcemaps/ts" ) : gutil.noop() )
			.pipe( gulp.dest( dest ) )
	];

	if ( options.genDefinition )
	{
		restTasks.push( stream.dts.pipe( gulp.dest( dest ) ) );
	}
	return merge2( restTasks );
}