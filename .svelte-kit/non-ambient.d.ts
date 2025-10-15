
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/Exchange" | "/GenerateQR";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/Exchange": Record<string, never>;
			"/GenerateQR": Record<string, never>
		};
		Pathname(): "/" | "/Exchange" | "/Exchange/" | "/GenerateQR" | "/GenerateQR/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/.nojekyll" | "/Enter.png" | "/bg-bg.png" | "/favicon.png" | "/loader (copy).png" | "/loader.png" | "/logo-tejor.png" | "/logo_black.png" | "/manifest.json" | "/pattern.png" | "/swap.png" | "/tejory-white.svg" | string & {};
	}
}