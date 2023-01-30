import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";

export default defineConfig( ( { command} ) => {
    if ( command === 'serve' )
    {
        return {
            // dev 固有の設定
            root: "demo",
            rollupOptions: {
                input: "index.html"
            }
        }
    }
    else
    {
        // command === 'build'
        return {
            // build 固有の設定
            build: {
                lib: {
                    entry: "src/knockout-decorator.ts",
                    name: "KnockoutDecorator"
                }
            },
            plugins: [
                dts()
            ]
        }
    }
} );