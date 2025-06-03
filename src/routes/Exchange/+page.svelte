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
		localStorage.setItem("Currency", selectedCurrency);
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
		let current = localStorage.getItem("Currency");
		if (current != null) {
			console.log(current);
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
		class="h-[45%] grid grid-cols-3 grid-rows-4 gap-3 rounded-md bg-white p-5"
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

	.button:hover .button-outer {
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

	.button:hover .button-inner {
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

	.button .button-inner span {
		position: relative;
		z-index: 4;
		font-family: "Inter", sans-serif;
		letter-spacing: -0.05em;
		font-weight: 500;
		color: rgba(0, 0, 0, 0);
		background-image: linear-gradient(
			135deg,
			rgba(25, 25, 25, 1),
			rgba(75, 75, 75, 1)
		);
		-webkit-background-clip: text;
		background-clip: text;
		transition: transform 250ms ease;
		display: block;
		will-change: transform;
		text-shadow: rgba(0, 0, 0, 0.1) 0 0 0.1em;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.button:hover .button-inner span {
		transform: scale(0.975);
	}

	.button:active .button-inner {
		transform: scale(0.975);
	}
</style>
