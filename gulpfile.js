
const gulp = require( "gulp" ),
	gutil = require( "gulp-util" ),
	uglify = require( "gulp-uglify" ),
	plumber = require( "gulp-plumber" ),
	rename = require( "gulp-rename" ),
	sourcemaps = require( "gulp-sourcemaps" ),
	sequence = require( "run-sequence" ),
	typescript = require( "gulp-typescript" ),
	sass = require( "gulp-sass" ),
	typedoc = require( "gulp-typedoc" ),
	merge2 = require( "merge2" ),
	insert = require( "gulp-insert" ),
	replace = require( "gulp-replace" ),
	webpack = require( "webpack" ),
	webpackStream = require( "webpack-stream" );

//#region build src typescript
gulp.task( "build:srcTs", () =>
{
	let isSourcemap = true;
	let isMinify = true;
	let config = require( "./tsconfig.src.json" );

	gulp.task( "_build1", () =>
	{
		let dest = "./dist";
		let tsStream = gulp.src( "./src/knockout-decorator.ts" )
			.pipe( plumber() )
			.pipe( isSourcemap ? sourcemaps.init() : gutil.noop() )
			.pipe( typescript( config.compilerOptions ) );

		return merge2( [
			// generate d.ts as export module
			tsStream.dts
				.pipe( replace( /^export =/m, "export default" ) )
				.pipe( gulp.dest( dest ) ),

			// generate js
			tsStream.js
				// To be able to build using webpack
				.pipe( replace( "typeof module === \"object\"", "(window && window.require !== undefined) && typeof module === \"object\"" ) )
				// To be able to use as not only import module but global variable also.
				.pipe( replace( "})(function (require, exports) {", "\
	else {\n\
		window[\"KnockoutDecorator\"]=factory();\n\
	}\n\
})(function (require, exports) {" ) )
				.pipe( isMinify ? uglify( {
					output: {
						comments: /^!/
					}
				} ) : gutil.noop() )
				.pipe( rename(( path ) =>
				{
					path.extname = ".min.js";
					return path;
				} ) )
				.pipe( isSourcemap ? sourcemaps.write( "." ) : gutil.noop() )
				.pipe( gulp.dest( dest ) )
		] );
	} );

	gulp.task( "_build2", () =>
	{
		// generate definitions for global
		return gulp.src( "./src/knockout-decorator.ts" )
			.pipe( plumber() )
			.pipe( typescript( config.compilerOptions ) )
			.dts
			.pipe( insert.append( "export as namespace KnockoutDecorator" ) )
			.pipe( rename(( path ) =>
			{
				path.basename = "knockout-decorator.d";
				return path;
			} ) )
			.pipe( gulp.dest( "./dist-globalDefinition" ) );
	} );

	return sequence( "_build1", "_build2" );

} );

gulp.task( "watch:ts", ["build:srcTs"], () =>
{
	return gulp.watch( "src/knockout-decorator.ts", ["build:srcTs"] );
} );
//#endregion

//#region demo
gulp.task( "build:demo", () =>
{
	let isSourcemap = false;
	let config = require( "./webpack.config.demo.js" );
	if ( isSourcemap )
	{
		config.devtool = "source-map";
	}
	config.plugins.push( new webpack.optimize.UglifyJsPlugin( {
		sourceMap: isSourcemap
	} ) );
	
	gulp.src( "dummy" )
		.pipe( plumber() )
		.pipe( webpackStream( config, webpack ) )
		.pipe( gulp.dest( "demo/js" ) );

	return gulp.src( "demo/sass/demo.scss" )
		.pipe( plumber() )
		.pipe( isSourcemap ? sourcemaps.init() : gutil.noop() )
		.pipe( sass() )
		.pipe( isSourcemap ? sourcemaps.write( "." ) : gutil.noop() )
		.pipe( gulp.dest( "demo/css" ) );
} );

gulp.task( "watch:demo", ["build:demo"], () =>
{
	gulp.watch( ["dist/knockout-decorator.min.js", "demo/ts/demo.ts", "demo/sass/sass.scss"], "build:demo" );
} );

gulp.task( "build:all", () =>
{
	sequence( "build:srcTs", "build:demo" );
} );

/*gulp.task( "build:demo_global", () =>
{
	let config = require( "./tsconfig.json" );
	return gulp.src( "demo/ts/demo.ts" )
		.pipe( typescript( config.compilerOptions ) )
		.pipe( gulp.dest( "demo/js" ) )

} );*/
//#endregion

// generate document
gulp.task( "doc:ts", () =>
{
	return gulp.src( ["src/**/*.ts", "typings/index.d.ts"] )
		.pipe( typedoc( {
			module: "amd",
			target: "es5",
			out: "doc",
			mode: "file",
			name: "knockout-decorator.",
			version: true
		} ) );
} );
