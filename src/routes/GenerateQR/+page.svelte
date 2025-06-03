<script>
	import "../../app.css";
	import { goto } from "$app/navigation";
	import Modal from "./Modal.svelte";
	import { onMount } from "svelte";

	let progress = $state(100);
	let duration = 5 * 60000;
	// let duration = 5000;
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
			console.log(current);
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
		// console.log("sasas");
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
			const qr = QRCode(0, "L"); // Type number 0 (auto) and error correction level 'L'
			invoice = obj["invoice"];
			txhash = obj["tx_hash"];
			qr.addData(invoice);
			// qr.addData("212121212");
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

<main class="flex h-dvh w-dvw flex-col">
	<section class="p-5">
		<h1 class="font-bold">Prepayment</h1>
		<p>This is a lightning network invoice. It will expire in 5 minutes.</p>
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
