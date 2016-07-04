﻿
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
	bower = require( "gulp-bower" ),
	typedoc = require( "gulp-typedoc" )
	merge2 = require( "merge2" );

gulp.task( "build:ts", () =>
{
	gulp.task( "_build:ts", () => buildTypeScript( "src/**/*.ts", "dist" ) );
	gulp.task( "_build:devTs", () => buildTypeScript( "src/**/*.ts", "dist", { min: false, genDefinition: true } ) );
	return sequence( ["_build:ts", "_build:devTs" ] );
} );

gulp.task( "watch:ts", ["build:ts"], () =>
{
	return gulp.watch( "src/**/*.ts", ["build:ts"] );
} );

gulp.task( "build:demo", () =>
{
	gulp.task( "_build:demo", () => buildTypeScript( "src/**/*.ts", "demo/js", { min: true, sourceMap: false } ) );
	gulp.task( "_buildDemo:ts", () => buildTypeScript( ["dist/knockout-decorator.d.ts", "demo/ts/**/*.ts"], "demo/js", { min: true, sourceMap: false } ) );
	gulp.task( "_buildDemo:sass", () =>
	{
		return gulp.src( "demo/sass/**/*.scss" )
			.pipe( plumber() )
			.pipe( sass() )
			.pipe( gulp.dest( "demo/css" ) );
	} );
	return sequence( "_build:demo", ["_buildDemo:ts", "_buildDemo:sass"] );
} );

gulp.task( "watch:demo", ["build:demo"], () =>
{
	gulp.watch( ["demo/ts/**/*.ts", "demo/sass/**/*.scss"], ["build:demo"] );
} );

gulp.task( "install:bower", () =>
{
	var bowerDir = "bower_components";
	gulp.task( "_install:bower", () => bower( bowerDir ) );
	gulp.task( "_move:knockout", () =>
	{
		return gulp.src( bowerDir + "/knockout/dist/knockout.js" )
			.pipe( gulp.dest( "demo/js" ) );
	} );
	gulp.task( "_move:SyntaxHighlighter", () =>
	{
		let dir = bowerDir + "/SyntaxHighlighter";
		let names = ["shCore", "shAutoloader", "XRegExp", "shBrushJScript", "shBrushXml"];
		let srcFiles = [];
		for ( let i = 0; i < names.length; ++i )
		{
			srcFiles.push( dir + "/scripts/" + names[i] + ".js" );
		}
		gulp.src( srcFiles )
			.pipe( gulp.dest( "demo/js/SyntaxHighlighter/scripts" ) );

		names = ["shCore", "shThemeRDark"];
		srcFiles = [];
		for ( let i = 0; i < names.length; ++i )
		{
			srcFiles.push( dir + "/styles/" + names[i] + ".css" );
		}
		return gulp.src( srcFiles )
			.pipe( gulp.dest( "demo/js/SyntaxHighlighter/styles" ) );
	} );

	return sequence( "_install:bower", "_move:knockout", "_move:SyntaxHighlighter" );
} );

gulp.task( "install:typings", () =>
{
	return gulp.src( "./typings.json" )
			.pipe(typings());
} );

gulp.task( "install", () =>
{
	return sequence( ["install:bower", "install:typings"], "build:ts", "build:demo" )
});

gulp.task( "doc:ts", () =>
{
	return gulp.src( ["src/**/*.ts", "typings/index.d.ts"] )
	.pipe( typedoc( {
		module:"amd",
		target: "es5",
		out: "docs",
		mode: "file",
		name: "knockout-decorator.",
		version:true
	}));
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
	
	var stream = gulp.src( src.concat("typings/index.d.ts") )
		.pipe( plumber() )
		.pipe( options.sourceMap ? sourcemaps.init() : gutil.noop() )
		.pipe( typescript( config.compilerOptions ) );
		
	let restTasks = [
		stream.pipe( options.min ? uglify( {
			preserveComments: "some"
		} ) : gutil.noop() )
			.pipe( options.min ? rename( { extname: ".min.js" } ) : gutil.noop() )
			.pipe( options.sourceMap ? sourcemaps.write( "../sourcemaps/ts" ) : gutil.noop() )
			.pipe( gulp.dest( dest ) )
	];

	if ( options.genDefinition )
	{
		restTasks.push( stream.dts.pipe( gulp.dest( dest ) ) );
	}
	

	return merge2( restTasks );
}