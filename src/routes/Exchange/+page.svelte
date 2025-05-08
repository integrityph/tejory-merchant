<script>
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	// State variables
	let fiatAmount = $state(""); // User-entered fiat amount
	let selectedCurrency = $state("php"); // Default currency set to PHP
	let lnBtcAmount = $state(0); // Converted LN-BTC amount
	let exchangeRates = $state({});
	let currencyList = $state([]);
	let invoice = $state("");
	let paid = $state(false);
	function onclick() {
		let sats = parseInt(lnBtcAmount * 100000000);
		goto("GenerateQR#" + sats + "," + fiatAmount);
	}
	// Fetch all currency rates
	async function fetchExchangeRates() {
		try {
			const resCurrencies = await fetch(
				"https://api.coingecko.com/api/v3/simple/supported_vs_currencies",
			);
			currencyList = await resCurrencies.json();

			const resRates = await fetch(
				`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencyList.join(",")}`,
			);
			const data = await resRates.json();
			exchangeRates = data.bitcoin;
			// updateLNBTCAmount();
		} catch (error) {
			console.error("Error fetching exchange rates:", error);
		}
	}

	// Convert fiat to LN-BTC when fiatAmount or currency changes
	$effect(() => {
		if (exchangeRates[selectedCurrency]) {
			lnBtcAmount = fiatAmount / exchangeRates[selectedCurrency];
		}
	});

	// Check for payment every 10 seconds
	onMount(() => {
		fetchExchangeRates();
		const interval = setInterval(() => {
			if (invoice) {
				checkPayment(invoice.payment_hash);
			}
		}, 10000);
		return () => clearInterval(interval);
	});

	// Handle Numeric Keypad Input
	function handleKeypadInput(value) {
		if (value === ".") {
			if (!fiatAmount.toString().includes(".")) {
				fiatAmount = fiatAmount.toString() + ".";
			}
		} else {
			fiatAmount = fiatAmount.toString() + value.toString();
		}
	}
</script>

<main class="relative flex h-dvh w-full flex-col gap-5 bg-neutral-200 px-5">
	<section class="relative mt-5 flex h-[40%] flex-col gap-2">
		<img
			src="swap.png"
			alt="Swap Icon"
			class="absolute top-0 right-0 bottom-0 left-0 m-auto w-15"
		/>

		<!-- Fiat Currency Input -->
		<div class="h-[100%] rounded-md bg-white p-2 shadow">
			<select
				bind:value={selectedCurrency}
				class="text-md block w-full border-0 bg-gray-50 text-gray-500 ring-0"
			>
				{#each currencyList as currency}
					<option value={currency}>{currency.toUpperCase()}</option>
				{/each}
			</select>
			<div
				class="flex h-[52px] w-full items-center rounded-sm border-0 p-3 text-xl ring-0"
			>
				{fiatAmount}
			</div>
		</div>
		<!-- BTC Input -->
		<div class="h-[100%] rounded-md bg-white p-2 shadow">
			<div class="text-md flex h-10 items-center indent-2 text-gray-500">
				BTC
			</div>
			<div
				class="w-full rounded-sm border-0 p-3 text-xl text-gray-500 ring-0"
			>
				{lnBtcAmount.toFixed(10)}
			</div>
		</div>
	</section>

	<!-- Numeric Keypad -->
	<section
		class="h-[45 %] grid grid-cols-3 grid-rows-4 gap-3 rounded-md bg-neutral-300 p-5"
	>
		{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0] as key}
			<div
				class="flex w-full cursor-pointer items-center justify-center rounded-md border-1 border-black bg-neutral-400 p-5 text-4xl font-bold text-white shadow-md hover:bg-neutral-500"
				onclick={() => handleKeypadInput(key)}
			>
				{key}
			</div>
		{/each}
		<div
			class="flex w-full cursor-pointer items-center justify-center rounded-md border-1 border-black bg-neutral-400 p-5 text-3xl font-bold text-white shadow-md hover:bg-neutral-500"
			onclick={() => (fiatAmount = "")}
		>
			C
		</div>
	</section>

	<!-- Payment & Conversion -->
	<main class="flex h-[20%] flex-col items-center">
		<!-- BTC Display -->
		<!-- <p class="mt-2 text-lg">
			💰 {fiatAmount}
			{selectedCurrency.toUpperCase()} ≈ {lnBtcAmount.toFixed(8)} BTC
		</p> -->

		<!-- Generate Invoice 
		 onclick={createInvoice}-->
		<button
			{onclick}
			class="mb-15 w-full rounded bg-neutral-700 px-3 py-3 text-white hover:bg-neutral-600"
		>
			Generate Lightning Invoice
		</button>
	</main>
</main>
