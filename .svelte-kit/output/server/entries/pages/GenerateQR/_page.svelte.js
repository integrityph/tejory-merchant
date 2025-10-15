import { h as pop, p as push, o as attr_style, k as escape_html, q as stringify } from "../../../chunks/index2.js";
/* empty css                  */
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import "@capacitor-community/bluetooth-le";
import "qrcode-generator";
import "@sveltejs/kit";
function Modal($$payload, $$props) {
  push();
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function _page($$payload, $$props) {
  push();
  let progress = 100;
  let invoice = void 0;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<main class="flex h-dvh w-dvw flex-col"><section class="p-5"><h1 class="font-bold">Prepayment</h1> <p>This is a lightning network invoice. It will expire in 5
				minutes.</p></section> <div class="progress-container svelte-y0bw7c"><div class="progress-bar svelte-y0bw7c"${attr_style(`width: ${stringify(progress)}%; background-color:hsl(${stringify(progress)}, 100%, 50%);`)}></div></div> <section class="bg-x relative flex flex-col items-center justify-center p-10 py-20">`;
    {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div>`;
      {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--> <div class="relative w-full"><p class="mt-6 w-62 overflow-hidden text-ellipsis">${escape_html(invoice)}</p></div> <button class="mt-8 w-full rounded-lg bg-red-600 p-3 font-bold text-white">Cancel Invoice</button></div>`;
    }
    $$payload.out += `<!--]--></section> `;
    Modal($$payload);
    $$payload.out += `<!----></main>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
export {
  _page as default
};
