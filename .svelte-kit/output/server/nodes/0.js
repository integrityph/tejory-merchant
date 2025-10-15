import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.C8ImEnUv.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/BcixZdGB.js"];
export const stylesheets = ["_app/immutable/assets/app.DLXhiyza.css"];
export const fonts = [];
