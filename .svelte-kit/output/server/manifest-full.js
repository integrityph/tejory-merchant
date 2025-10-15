export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".nojekyll","Enter.png","bg-bg.png","favicon.png","loader (copy).png","loader.png","logo-tejor.png","logo_black.png","manifest.json","pattern.png","swap.png","tejory-white.svg","service-worker.js"]),
	mimeTypes: {".png":"image/png",".json":"application/json",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.B8tV3Xda.js",app:"_app/immutable/entry/app.B7B0jw6Q.js",imports:["_app/immutable/entry/start.B8tV3Xda.js","_app/immutable/chunks/Dl-3ZZtL.js","_app/immutable/chunks/3qGMOLUM.js","_app/immutable/chunks/BcixZdGB.js","_app/immutable/entry/app.B7B0jw6Q.js","_app/immutable/chunks/BATqu6zb.js","_app/immutable/chunks/BcixZdGB.js","_app/immutable/chunks/3qGMOLUM.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/XYqiCeIK.js","_app/immutable/chunks/DIUc8x7l.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/Exchange",
				pattern: /^\/Exchange\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/GenerateQR",
				pattern: /^\/GenerateQR\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
