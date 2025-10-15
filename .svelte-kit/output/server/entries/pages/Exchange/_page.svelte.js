import { m as ensure_array_like, l as attr, k as escape_html, h as pop, p as push } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import "postcss";
function _page($$payload, $$props) {
  push();
  let fiatAmount = "";
  let lnBtcAmount = 0;
  let currencyList = [];
  const each_array = ensure_array_like(currencyList);
  const each_array_1 = ensure_array_like([1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0]);
  $$payload.out += `<main class="relative flex h-dvh w-full flex-col gap-5 bg-neutral-200 px-5"><section class="relative mt-5 flex h-[40%] flex-col gap-2"><img src="swap.png" alt="Swap Icon" class="absolute top-0 right-0 bottom-0 left-0 m-auto w-15"> <div class="h-[100%] rounded-md bg-white p-2 shadow"><select class="text-md block w-full border-0 bg-gray-50 text-gray-500 ring-0"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let currency = each_array[$$index];
    $$payload.out += `<option${attr("value", currency)}>${escape_html(currency.toUpperCase())}</option>`;
  }
  $$payload.out += `<!--]--></select> <div class="flex h-[52px] w-full items-center rounded-sm border-0 p-3 text-xl ring-0">${escape_html(fiatAmount)}</div></div> <div class="h-[100%] rounded-md bg-white p-2 shadow"><div class="text-md flex h-10 items-center indent-2 text-gray-500">BTC</div> <div class="w-full rounded-sm border-0 p-3 text-xl text-gray-500 ring-0">${escape_html(lnBtcAmount.toFixed(10))}</div></div></section> <section class="h-[45%] grid grid-cols-3 grid-rows-4 gap-3 rounded-md bg-white p-5"><!--[-->`;
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let key = each_array_1[$$index_1];
    $$payload.out += `<button class="button svelte-1sedk03"><div class="button-outer flex justify-center items-center w-full svelte-1sedk03"><div class="button-inner w-full flex justify-center items-center text-3xl text-neutral-700 svelte-1sedk03">${escape_html(key)}</div></div></button>`;
  }
  $$payload.out += `<!--]--> <button class="button svelte-1sedk03"><div class="button-outer flex justify-center items-center w-full svelte-1sedk03"><div class="button-inner w-full flex justify-center items-center text-3xl text-red-800 svelte-1sedk03">C</div></div></button></section> <main class="flex h-[20%] flex-col items-center"><button class="mb-15 w-full rounded bg-neutral-700 px-3 py-3 text-white hover:bg-neutral-600">Generate Lightning Invoice</button></main></main>`;
  pop();
}
export {
  _page as default
};
