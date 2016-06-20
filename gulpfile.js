
var gulp = require( "gulp" ),
	gutil = require( "gulp-util" ),
	uglify = require( "gulp-uglify" ),
	plumber = require( "gulp-plumber" ),
	typings = require( "gulp-typings" ),
	rename = require( "gulp-rename" ),
	sourcemaps = require( "gulp-sourcemaps" ),
	sequence = require( "run-sequence" ),
	typescript = require( "gulp-typescript" ),
	sass = require( "gulp-sass" ),
	bower = require( "gulp-bower" );

gulp.task( "build:ts", () =>
{
	gulp.task( "_build:ts", () => buildTypeScript( "src/**/*.ts", "dist" ) );
	gulp.task( "_build:devTs", () => buildTypeScript( "src/**/*.ts", "dist", { min: false } ) );
	gulp.task( "_build:demo", () => buildTypeScript( "src/**/*.ts", "demo/js", { min: false, sourceMap: true } ) );
	return sequence( ["_build:ts", "_build:devTs", "_build:demo"] );
} );

gulp.task( "watch:ts", ["build:ts"], () =>
{
	return gulp.watch( "src/**/*.ts", ["build:ts"] );
} );

gulp.task( "build:demo", () =>
{
	gulp.task( "_buildDemo:ts", () => buildTypeScript( "demo/ts/**/*.ts", "demo/js", { min:false, sourceMap: true } ) );
	gulp.task( "_buildDemo:sass", () =>
	{
		return gulp.src( "demo/sass/**/*.scss" )
			.pipe( sourcemaps.init() )
			.pipe( plumber() )
			.pipe( sass() )
			.pipe( sourcemaps.write( "../sourcemaps/sass" ) )
			.pipe( gulp.dest( "demo/css" ) );
	} );
	return sequence( [ "_buildDemo:ts", "_buildDemo:sass"] );
} );

gulp.task( "install:bower", () =>
{
	var bowerDir = "bower_components";
	gulp.task( "_install:bower", () => bower( bowerDir ) );
	gulp.task( "_move:distToDemo", () =>
	{
		gulp.src( bowerDir + "/knockout/dist/knockout.js" )
			.pipe( gulp.dest( "demo/js" ) );
	} );
	return sequence( "_install:bower", "_move:distToDemo" );
} );

gulp.task( "install:typings", () =>
{
	return gulp.src( "./typings.json" )
			.pipe(typings());
} );

function buildTypeScript( src, dest, options )
{
	options = options || {};
	if ( options.min === undefined ) options.min = true;

	var config = require( "./tsconfig.json" );
	if ( Array.isArray( src ) === false )
	{
		src = [src];
	}
	
	return gulp.src( src.concat("typings/index.d.ts") )
		.pipe( plumber() )
		.pipe( options.sourceMap ? sourcemaps.init() : gutil.noop() )
		.pipe( typescript( config.compilerOptions ) )
		.pipe( options.min ? uglify( {
			preserveComments: "some"
		} ) : gutil.noop() )
		.pipe( options.min ? rename( { extname:".min.js"} ) : gutil.noop() )
		.pipe( options.sourceMap ? sourcemaps.write( "../sourcemaps/ts" ) : gutil.noop() )
		.pipe( gulp.dest( dest ) );
}