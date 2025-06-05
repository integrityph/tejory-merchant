<script>
	import "../../app.css";
	import { goto } from "$app/navigation";
	import Modal from "./Modal.svelte";
	import { onMount } from "svelte";

	let progress = $state(100);
	let duration = 5 * 60000;

	let intervalTime = 100;
	let decrement = 100 / (duration / intervalTime);
	let isQRExpired = $state(false);
	let session = false;
	let paymentCheckInterval;
	let isModalOpen = $state(false);
	let qrStatus = $state(""); // "success" or "error"
	let qrMessage = $state("");
	let amountFiat = $state(0.0);
	let paymentReference = $state("");
	let fiatSymbol = $state("PHP");
	let status = $state();

	function onclick() {
		goto("Exchange");
	}

	function regenerateqr() {
		isQRExpired = false;
		progress = 100;
		generateQrCode(sats);
	}

	// Simulate QR Scan Detection & Payment Check
	async function checkPaymentStatus() {
		try {
			const response = await fetch("src/routes/GenerateQR/sample.json"); // Replace with actual API
			const result1 = await response.json();
			const result = result1[0];
			if (result.status === "paid") {
				qrStatus = "success";
				qrMessage = "Your payment has been received!";
				isModalOpen = true;

				clearInterval(paymentCheckInterval);
			} else if (result.status === "failed") {
				qrStatus = "error";
				qrMessage = "Payment failed. Please try again.";
				isModalOpen = true;
				clearInterval(paymentCheckInterval);
			}
		} catch (error) {
			console.error("Error checking payment status:", error);
		}
	}

	onMount(() => {
		let current = localStorage.getItem("Currency").toUpperCase();
		if (current != null) {
			// console.log(current);
			fiatSymbol = current;
		}
		let amounts = location.hash.replaceAll("#", "").split(",");
		sats = parseInt(amounts[0]);
		amountFiat = parseFloat(amounts[1]);
		generateQrCode(sats);
	});

	// QR code Generation
	import QRCode from "qrcode-generator";
	import { error } from "@sveltejs/kit";

	let sats = $state("");
	let qrCodeDataUrl = $state();
	let invoice = $state();
	let txhash = null;

	function generateQrCode(sats) {
		let reqObj = {
			amount: sats.toString(),
			expiry: 60 * 5,
		};

		fetch("https://ln.tejory.io/makeinvoice", {
			method: "POST",
			mode: "cors",
			headers: {
				pubkey: localStorage.getItem("pubkey"),
				token: localStorage.getItem("token"),
				"Access-Control-Allow-Headers": "*",
			},
			body: JSON.stringify(reqObj),
		}).then(async (response) => {
			let resObjRaw = await response.text();
			console.log(resObjRaw);

			let obj = JSON.parse(resObjRaw);
			// console.log(obj["status"]);
			if (obj["status"] != "ok") {
				status = false;
			} else {
				status = true;
			}
			const qr = QRCode(0, "L"); // Type number 0 (auto) and error correction level 'L'
			invoice = obj["invoice"];
			txhash = obj["tx_hash"];
			// console.log(invoice, obj);
			qr.addData(invoice);
			qr.make();
			qrCodeDataUrl = qr.createDataURL(12, 0); // Scale 8, margin 0

			streamEvents(txhash);

			// Start QR expiration countdown
			const interval = setInterval(() => {
				if (progress > 0) {
					progress = Math.max(progress - decrement, 0);
				} else {
					clearInterval(interval);
					// console.log('QR Expired');
					isQRExpired = true;
				}
			}, intervalTime);

			return () => {
				clearInterval(interval);
			};
		});
	}

	function streamEvents(txhash) {
		if (window["WebSocket"]) {
			let pubkey = localStorage.getItem("pubkey");
			let token = localStorage.getItem("token");
			let conn = new WebSocket(
				`wss://ln.tejory.io/streamevents?auth=${pubkey},${token}`,
			);
			conn.onclose = function (evt) {
				// if websocket fails, try to get the tx status from another API
			};
			conn.onmessage = function (evt) {
				var messages = evt.data.split("\n");
				for (var i = 0; i < messages.length; i++) {
					let obj = JSON.parse(messages[i]);
					if (obj["txid"] != undefined) {
						if (obj["txid"] == txhash) {
							if (obj["settled"] == true) {
								paymentReference = txhash.substring(0, 10);
								qrStatus = "success";
								qrMessage = "Your payment has been received!";
								isModalOpen = true;
							}
						}
					}
				}
			};
		} else {
			// if websocket is not supported, try to get the tx status from another API
		}
	}
</script>

{#if status != false}
	<main class="flex h-dvh w-dvw flex-col">
		<section class="p-5">
			<h1 class="font-bold">Prepayment</h1>
			<p>
				This is a lightning network invoice. It will expire in 5
				minutes.
			</p>
		</section>

		<!-- Progress Bar -->
		<div class="progress-container">
			<div
				class="progress-bar"
				style="width: {progress}%; background-color:hsl({progress}, 100%, 50%);"
			></div>
		</div>

		<section
			class="bg-x relative flex flex-col items-center justify-center p-10 py-20"
		>
			{#if !isQRExpired}
				<div>
					{#if qrCodeDataUrl}
						<p
							class="mb-2 rounded bg-[#ffffffda] text-center font-bold"
						>
							{fiatSymbol}
							{amountFiat.toFixed(2)}
						</p>
						<img
							src={qrCodeDataUrl}
							alt="QR Code"
							class="w-full rounded-md border-15 border-white shadow-2xl shadow-black"
						/>
					{/if}
					<div class="relative w-full">
						<p class="mt-6 w-62 overflow-hidden text-ellipsis">
							{invoice}
						</p>
					</div>

					<button
						{onclick}
						class="mt-8 w-full rounded-lg bg-red-600 p-3 font-bold text-white"
						>Cancel Invoice</button
					>
				</div>
			{:else}
				<div
					class="flex min-h-69 w-[90%] flex-col items-center justify-center gap-5"
				>
					<svg
						version="1.1"
						id="Layer_1"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						viewBox="0 0 345.8 345.8"
						enable-background="new 0 0 345.8 345.8"
						xml:space="preserve"
						width="128px"
						height="128px"
						fill="#000000"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier">
							<g>
								<circle
									fill="none"
									stroke="#FFFFFF"
									stroke-width="0.75"
									stroke-miterlimit="10"
									cx="172.9"
									cy="172.9"
									r="172.5"
								></circle>
								<circle
									fill="#E1473F"
									cx="172.9"
									cy="172.9"
									r="172.5"
								></circle>
								<circle
									fill="#FF5F57"
									cx="172.9"
									cy="172.9"
									r="157.5"
								></circle>
								<g>
									<path
										fill="#752521"
										d="M160.4,80.4c5.7-5.3,12.4-8,20.1-8c7.8,0,14.5,2.7,20.1,8c5.6,5.3,8.3,11.7,8.3,19.3 c0,3.7-0.8,9.3-2.3,16.6c-1.6,7.4-3.3,14.9-5.1,22.6c-2.1,8.4-4.4,18.8-7,31.2c-2.6,12.4-5.4,27.9-8.3,46.6h-11.3 c-2.9-18.5-5.7-34-8.3-46.5c-2.6-12.5-5-23-7-31.4c-2.1-8.9-3.9-16.6-5.3-23.2c-1.4-6.6-2.1-11.9-2.1-15.9 C151.9,92.1,154.7,85.7,160.4,80.4z M160.6,242.2c5.6-5.4,12.2-8.1,19.7-8.1c7.6,0,14.2,2.7,19.8,8.1c5.6,5.4,8.4,11.8,8.4,19.3 c0,7.4-2.8,13.8-8.4,19.1c-5.6,5.3-12.2,8-19.8,8c-7.5,0-14.1-2.7-19.7-8c-5.6-5.3-8.4-11.7-8.4-19.1 C152.2,254.1,155,247.6,160.6,242.2z"
									></path>
								</g>
								<g>
									<path
										fill="#FFFFFF"
										d="M152.9,72.8c5.7-5.3,12.4-8,20.1-8c7.8,0,14.5,2.7,20.1,8c5.6,5.3,8.3,11.7,8.3,19.3 c0,3.7-0.8,9.3-2.3,16.6c-1.6,7.4-3.3,14.9-5.1,22.6c-2.1,8.4-4.4,18.8-7,31.2c-2.6,12.4-5.4,27.9-8.3,46.6h-11.3 c-2.9-18.5-5.7-34-8.3-46.5c-2.6-12.5-5-23-7-31.4c-2.1-8.9-3.9-16.6-5.3-23.2c-1.4-6.6-2.1-11.9-2.1-15.9 C144.4,84.5,147.2,78.1,152.9,72.8z M153.1,234.6c5.6-5.4,12.2-8.1,19.7-8.1c7.6,0,14.2,2.7,19.8,8.1c5.6,5.4,8.4,11.8,8.4,19.3 c0,7.4-2.8,13.8-8.4,19.1c-5.6,5.3-12.2,8-19.8,8c-7.5,0-14.1-2.7-19.7-8c-5.6-5.3-8.4-11.7-8.4-19.1 C144.7,246.5,147.5,240,153.1,234.6z"
									></path>
								</g>
							</g>
						</g></svg
					>
					<p class="text-xl">Qr Code has Expired</p>
					<button onclick={regenerateqr} class="bg-green-400 p-3">
						Regenerate new QR code</button
					>
				</div>
				<!-- <p class="absolute bottom-5 left-10 max-w-[80%] overflow-hidden text-ellipsis">
				{invoice}
			</p> -->
			{/if}
		</section>

		<!-- Modal Alert -->
		<Modal
			isOpen={isModalOpen}
			message={qrMessage}
			status={qrStatus}
			amountCrypto={parseInt(sats) / 100000000}
			cryptoSymbol={"BTC"}
			{amountFiat}
			{fiatSymbol}
			{paymentReference}
		/>
	</main>
{:else}
	<main
		class="flex h-dvh w-dvw flex-col justify-center items-center text-center gap-3 bg-neutral-200"
	>
		<div
			class="bg-white flex flex-col gap-9 p-3 text-center rounded shadow-lg"
		>
			<div class="flex gap-3">
				<svg
					width="35px"
					height="35px"
					viewBox="0 0 16 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
						id="SVGRepo_tracerCarrier"
						stroke-linecap="round"
						stroke-linejoin="round"
					></g><g id="SVGRepo_iconCarrier"
						><path
							d="M7.493 0.015 C 7.442 0.021,7.268 0.039,7.107 0.055 C 5.234 0.242,3.347 1.208,2.071 2.634 C 0.660 4.211,-0.057 6.168,0.009 8.253 C 0.124 11.854,2.599 14.903,6.110 15.771 C 8.169 16.280,10.433 15.917,12.227 14.791 C 14.017 13.666,15.270 11.933,15.771 9.887 C 15.943 9.186,15.983 8.829,15.983 8.000 C 15.983 7.171,15.943 6.814,15.771 6.113 C 14.979 2.878,12.315 0.498,9.000 0.064 C 8.716 0.027,7.683 -0.006,7.493 0.015 M8.853 1.563 C 9.967 1.707,11.010 2.136,11.944 2.834 C 12.273 3.080,12.920 3.727,13.166 4.056 C 13.727 4.807,14.142 5.690,14.330 6.535 C 14.544 7.500,14.544 8.500,14.330 9.465 C 13.916 11.326,12.605 12.978,10.867 13.828 C 10.239 14.135,9.591 14.336,8.880 14.444 C 8.456 14.509,7.544 14.509,7.120 14.444 C 5.172 14.148,3.528 13.085,2.493 11.451 C 2.279 11.114,1.999 10.526,1.859 10.119 C 1.618 9.422,1.514 8.781,1.514 8.000 C 1.514 6.961,1.715 6.075,2.160 5.160 C 2.500 4.462,2.846 3.980,3.413 3.413 C 3.980 2.846,4.462 2.500,5.160 2.160 C 6.313 1.599,7.567 1.397,8.853 1.563 M7.706 4.290 C 7.482 4.363,7.355 4.491,7.293 4.705 C 7.257 4.827,7.253 5.106,7.259 6.816 C 7.267 8.786,7.267 8.787,7.325 8.896 C 7.398 9.033,7.538 9.157,7.671 9.204 C 7.803 9.250,8.197 9.250,8.329 9.204 C 8.462 9.157,8.602 9.033,8.675 8.896 C 8.733 8.787,8.733 8.786,8.741 6.816 C 8.749 4.664,8.749 4.662,8.596 4.481 C 8.472 4.333,8.339 4.284,8.040 4.276 C 7.893 4.272,7.743 4.278,7.706 4.290 M7.786 10.530 C 7.597 10.592,7.410 10.753,7.319 10.932 C 7.249 11.072,7.237 11.325,7.294 11.495 C 7.388 11.780,7.697 12.000,8.000 12.000 C 8.303 12.000,8.612 11.780,8.706 11.495 C 8.763 11.325,8.751 11.072,8.681 10.932 C 8.616 10.804,8.460 10.646,8.333 10.580 C 8.217 10.520,7.904 10.491,7.786 10.530 "
							stroke="none"
							fill-rule="evenodd"
							fill="#fb2c36"
						></path></g
					></svg
				>
				<p class="text-3xl text-red-500">Error</p>
			</div>

			<p class="text-lg">Amount is too small Please try again!</p>

			<button
				onclick={() => goto("Exchange")}
				class="bg-gray-200 py-1 px-10 rounded hover:bg-gray-400 active:bg-gray-400"
				>Ok</button
			>
		</div>
	</main>
{/if}

<style>
	.progress-container {
		width: 100%;
		min-height: 10px;
		background-color: #6f6f6f;
		overflow: hidden;
		margin-top: 10px;
		box-shadow: 0px 5px 3px 0px #000000;
	}

	.progress-bar {
		height: 100%;
		transition: width 0.1s linear;
	}
</style>
