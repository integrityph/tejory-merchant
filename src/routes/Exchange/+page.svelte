<script>
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { Warning } from "postcss";
	import "../../app.css";
	// State variables
	let fiatAmount = $state(""); // User-entered fiat amount
	let fiatAmountBaseUSDB = $state(""); // User-entered fiat amount
	let selectedCurrency = $state("usd"); // Default currency set to PHP
	let lnBtcAmount = $state(0); // Converted LN-BTC amount
	let exchangeRates = $state({});
	let currencyList = $state([]);
	let invoice = $state("");
	let paid = $state(false);

	function onclick() {
		localStorage.setItem("Currency", selectedCurrency);
		let sats = parseInt(lnBtcAmount * 100000000);
		goto("GenerateQR#" + fiatAmount + "," + fiatAmountBaseUSDB);
	}

	const priceProviders = [fetchRateFromCoingecko];
	// Fetch all currency rates
	async function fetchExchangeRates() {
		let rate = null;
		currencyList = ["usd", "php"];

		// Correctly get a random starting index
		const randomIndex = 0; //Math.floor(Math.random() * priceProviders.length);

		// Loop through all providers, starting from the random index
		for (let i = 0; i < priceProviders.length; i++) {
			let providerIndex = (i + randomIndex) % priceProviders.length;
			console.log(`Trying price provider #${providerIndex}...`);
			
			// Correctly CALL the function
			rate = await priceProviders[providerIndex](); 

			if (rate !== null) {
				console.log(`Success with provider #${providerIndex}! rate=${rate.USD}`);
				break; // Exit the loop on the first success
			}
		}

		// Assign the successful result, or null if all failed
		if (rate) {
			exchangeRates = rate;
		} else {
			console.error("All price providers failed.");
			// You might want to show an error to the user here
		}
	}

	async function fetchRateFromCoingecko() {
		try {
			// const resCurrencies = await fetch(
			// 	"https://api.coingecko.com/api/v3/simple/supported_vs_currencies",
			// );
			// currencyList = ["USD", "PHP"];

			const resRates = await fetch(
				`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencyList.join(",")}`,
			);
			const data = await resRates.json();
			return data.bitcoin;
		} catch (error) {
			console.error("Error fetching exchange rates:", error);
			return null;
		}
	}

	// Convert fiat to LN-BTC when fiatAmount or currency changes
	$effect(() => {
		if (exchangeRates[selectedCurrency]) {
			lnBtcAmount = fiatAmount / exchangeRates[selectedCurrency];
			// get the fiat amount in USD
			fiatAmountBaseUSDB = ((fiatAmount / (exchangeRates[selectedCurrency] / exchangeRates["usd"])).toFixed(6) * 1_000_000).toString();
		}
	});

	// Check for payment every 10 seconds
	onMount(() => {
		let current = localStorage.getItem("Currency");
		if (current != null) {
			selectedCurrency = current;
		}
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

<main class="relative flex w-full flex-col gap-5 bg-transparent">
	<div
			style="opacity:0.8; background-image:url(pattern.png);"
			class="item-center absolute z-[-2] flex h-full w-full items-center justify-center bg-neutral-500"
		></div>
	<div
			style="background-image: linear-gradient(to bottom, rgba(141, 141, 141, 0.45), rgba(0, 0, 0, 0.91));"
			class="item-center absolute z-[-1] flex h-full w-full items-center justify-center"
		></div>
	<div class="main-content relative flex h-full w-full flex-col gap-5">
		<section class="h-[45%] relative px-5 mt-5 flex flex-col gap-2">
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
					style="font-family:DSEG7"
					class="flex pt-2 px-4 w-full items-center rounded-sm border-0 text-7xl ring-0"
				>
					{fiatAmount?fiatAmount:0}
				</div>
			</div>
			<!-- BTC Input -->
			<div class="h-[100%] rounded-md bg-white p-2 shadow">
				<div class="text-md flex h-10 items-center indent-2 text-gray-500">
					Estimated BTC (<span style="font-family: monospace">1 BTC = <span class="text-black font-bold">{exchangeRates[selectedCurrency]?.toLocaleString()}</span> {selectedCurrency.toUpperCase()}</span> )
				</div>
				<div
					style="font-family:DSEG7"
					class="w-full pt-2 px-4 rounded-sm border-0 text-7xl text-gray-500 ring-0"
				>
					{lnBtcAmount.toFixed(8)}
				</div>
			</div>
		</section>

		<!-- Numeric Keypad -->
		<section
			class="h-[50%] px-5 grid grid-cols-3 grid-rows-4 gap-3 rounded-md bg-neutral-700 p-5"
		>
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0] as key}
				<button class="button" onclick={() => handleKeypadInput(key)}>
					<div
						class="button-outer flex justify-center items-center w-full"
					>
						<div
							class="button-inner w-full flex justify-center items-center text-3xl text-neutral-700"
						>
							{key}
						</div>
					</div>
				</button>
			{/each}
			<button class="button" onclick={() => (fiatAmount = "")}>
				<div class="button-outer flex justify-center items-center w-full">
					<div
						class="button-inner w-full flex justify-center items-center text-3xl text-red-800"
					>
						C
					</div>
				</div>
			</button>
		</section>

		<div class="flex h-[5%] flex-col items-center px-5 align-bottom">
		<!-- BTC Display -->
		<!-- <p class="mt-2 text-lg">
			💰 {fiatAmount}
			{selectedCurrency.toUpperCase()} ≈ {lnBtcAmount.toFixed(8)} BTC
		</p> -->

		<!-- Generate Invoice 
		onclick={createInvoice}-->
		<button
			onclick={(lnBtcAmount == 0)? null : onclick}
			disabled={lnBtcAmount == 0}
			class="generate-button mb-15 w-full rounded bg-neutral-700 px-3 py-3 text-white hover:bg-neutral-600 font-bold text-xl"
		>
			Generate Lightning Invoice
		</button>
	</div>
	</div>

	<!-- Payment & Conversion -->
	
</main>

<style>
	.button {
		all: unset;
		cursor: pointer;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		position: relative;
		border-radius: 100em;
		background-color: rgba(0, 0, 0, 0.75);
		box-shadow:
			-0.15em -0.15em 0.15em -0.075em rgba(5, 5, 5, 0.25),
			0.0375em 0.0375em 0.0675em 0 rgba(5, 5, 5, 0.1);
	}

	.button::after {
		content: "";
		position: absolute;
		z-index: 0;
		width: calc(100% + 0.3em);
		height: calc(100% + 0.3em);
		top: -0.15em;
		left: -0.15em;
		border-radius: inherit;
		background: linear-gradient(
			-135deg,
			rgba(5, 5, 5, 0.5),
			transparent 20%,
			transparent 100%
		);
		filter: blur(0.0125em);
		opacity: 0.25;
		mix-blend-mode: multiply;
	}

	.button .button-outer {
		position: relative;
		z-index: 1;
		border-radius: inherit;
		height: 100%;
		transition: box-shadow 300ms ease;
		will-change: box-shadow;
		box-shadow:
			0 0.05em 0.05em -0.01em rgba(5, 5, 5, 1),
			0 0.01em 0.01em -0.01em rgba(5, 5, 5, 0.5),
			0.15em 0.3em 0.1em -0.01em rgba(5, 5, 5, 0.25);
	}

	.button:active .button-outer {
		box-shadow:
			0 0 0 0 rgba(5, 5, 5, 1),
			0 0 0 0 rgba(5, 5, 5, 0.5),
			0 0 0 0 rgba(5, 5, 5, 0.25);
	}

	.button-inner {
		--inset: 0.035em;
		position: relative;
		z-index: 1;
		border-radius: inherit;
		height: 100%;
		background-image: linear-gradient(
			135deg,
			rgba(230, 230, 230, 1),
			rgba(180, 180, 180, 1)
		);
		transition:
			box-shadow 300ms ease,
			clip-path 250ms ease,
			background-image 250ms ease,
			transform 250ms ease;
		will-change: box-shadow, clip-path, background-image, transform;
		overflow: clip;
		clip-path: inset(0 0 0 0 round 100em);
		box-shadow:
        /* 1 */
			0 0 0 0 inset rgba(5, 5, 5, 0.1),
			/* 2 */ -0.05em -0.05em 0.05em 0 inset rgba(5, 5, 5, 0.25),
			/* 3 */ 0 0 0 0 inset rgba(5, 5, 5, 0.1),
			/* 4 */ 0 0 0.05em 0.2em inset rgba(255, 255, 255, 0.25),
			/* 5 */ 0.025em 0.05em 0.1em 0 inset rgba(255, 255, 255, 1),
			/* 6 */ 0.12em 0.12em 0.12em inset rgba(255, 255, 255, 0.25),
			/* 7 */ -0.075em -0.25em 0.25em 0.1em inset rgba(5, 5, 5, 0.25);
	}

	.button:active .button-inner {
		clip-path: inset(
			clamp(1px, 0.0625em, 2px) clamp(1px, 0.0625em, 2px)
				clamp(1px, 0.0625em, 2px) clamp(1px, 0.0625em, 2px) round 100em
		);
		box-shadow:
        /* 1 */
			0.1em 0.15em 0.05em 0 inset rgba(5, 5, 5, 0.75),
			/* 2 */ -0.025em -0.03em 0.05em 0.025em inset rgba(5, 5, 5, 0.5),
			/* 3 */ 0.25em 0.25em 0.2em 0 inset rgba(5, 5, 5, 0.5),
			/* 4 */ 0 0 0.05em 0.5em inset rgba(255, 255, 255, 0.15),
			/* 5 */ 0 0 0 0 inset rgba(255, 255, 255, 1),
			/* 6 */ 0.12em 0.12em 0.12em inset rgba(255, 255, 255, 0.25),
			/* 7 */ -0.075em -0.12em 0.2em 0.1em inset rgba(5, 5, 5, 0.25);
	}

	.button:active .button-inner {
		transform: scale(0.975);
	}

	button.generate-button:disabled {
		opacity:0.2;
	}
</style>
