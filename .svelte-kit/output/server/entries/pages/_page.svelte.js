import "clsx";
import { l as attr, h as pop, p as push } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
/* empty css               */
import "qrcode-generator";
import "@capacitor-community/bluetooth-le";
function Loader($$payload, $$props) {
  push();
  let remoteToken = "";
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="loader item-center absolute z-10 flex h-dvh w-full items-center justify-center bg-white svelte-1cx9ik3" style="background-image:url(pattern.png);"><div style="opacity:0.9" class="loader item-center absolute z-10 flex h-dvh w-full items-center justify-center bg-neutral-500 svelte-1cx9ik3"></div> <div style="background-image: linear-gradient(to bottom, rgba(255, 0, 0, 0), rgb(0 0 0));" class="loader item-center absolute z-10 flex h-dvh w-full items-center justify-center svelte-1cx9ik3">`;
    {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<div style="display: block" class="px-3 svelte-1cx9ik3"><h2 class="rounded bg-white p-2 text-center font-bold svelte-1cx9ik3">This terminal is not initialized</h2> <div class="svelte-1cx9ik3">`;
      {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--></div> <div class="my-4 rounded bg-[#ffffffa9] p-4 text-gray-800 shadow svelte-1cx9ik3"><p class="text-sm font-semibold mb-2 svelte-1cx9ik3">To link via QR Code:</p> <ul class="list-inside list-disc space-y-1 svelte-1cx9ik3"><li class="svelte-1cx9ik3">Go to "Settings" in Tejory Wallet</li> <li class="svelte-1cx9ik3">Click "Link Terminal"</li> <li class="svelte-1cx9ik3">Scan the QR code to activate this terminal</li></ul> <div class="relative flex items-center my-2 svelte-1cx9ik3"><div class="flex-grow border-t border-gray-300 svelte-1cx9ik3"></div> <span class="flex-shrink mx-4 text-sm text-gray-500 svelte-1cx9ik3">OR</span> <div class="flex-grow border-t border-gray-300 svelte-1cx9ik3"></div></div> <div class="svelte-1cx9ik3"><label for="token-input" class="block text-sm font-semibold mb-2 svelte-1cx9ik3">Paste your initialization token here:</label> <div class="flex space-x-2 svelte-1cx9ik3"><input id="token-input" type="text"${attr("value", remoteToken)} placeholder="e.g., 021234..." class="flex-grow w-full rounded border border-gray-300 bg-white/80 p-2 font-mono focus:ring-blue-500 focus:border-blue-500 svelte-1cx9ik3"> <button${attr("disabled", !remoteToken.trim(), true)} class="px-4 py-2 font-semibold text-white bg-blue-600 rounded shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed svelte-1cx9ik3">Link</button></div></div></div></div>`;
    }
    $$payload.out += `<!--]--></div></div>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function _page($$payload, $$props) {
  push();
  $$payload.out += `<main class="relative h-dvh w-full bg-neutral-400">`;
  Loader($$payload);
  $$payload.out += `<!----> <div class="absoulte bg-x flex h-dvh w-full flex-col items-end justify-end p-5 md:h-dvh"><button type="button" class="mb-5 flex w-full items-center justify-center gap-5 rounded bg-neutral-700 px-4 py-3 text-white hover:bg-neutral-600"><svg width="30px" height="30px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><g fill="none" fill-rule="evenodd"><circle cx="16" cy="16" r="16" fill="#F7931A"></circle><path fill="#FFF" fill-rule="nonzero" d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"></path></g></g></svg> <p class="w-36">Bitcoin Lightning</p></button> <button disabled type="button" class="flex w-full items-center justify-center gap-5 rounded bg-neutral-700 px-4 py-3 text-white blur-[0.8px] hover:bg-neutral-600"><svg width="30px" height="30px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><g fill="none" fill-rule="evenodd"><circle cx="16" cy="16" r="16" fill="#627EEA"></circle><g fill="#FFF" fill-rule="nonzero"><path fill-opacity=".602" d="M16.498 4v8.87l7.497 3.35z"></path><path d="M16.498 4L9 16.22l7.498-3.35z"></path><path fill-opacity=".602" d="M16.498 21.968v6.027L24 17.616z"></path><path d="M16.498 27.995v-6.028L9 17.616z"></path><path fill-opacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"></path><path fill-opacity=".602" d="M9 16.22l7.498 4.353v-7.701z"></path></g></g></g></svg> <p class="w-36">Ethereum</p></button></div></main>`;
  pop();
}
export {
  _page as default
};
