<script>
	import { onMount } from "svelte";
	import QRCode from "qrcode-generator";

	let initialized = $state(false);
	let loading = $state(true);
	let tempToken = null;
	let qrCodeDataUrl = $state();

	function buf2hex(buffer) {
		// buffer is an ArrayBuffer
		return [...new Uint8Array(buffer)]
			.map((x) => x.toString(16).padStart(2, "0"))
			.join("");
	}

	// Simulate a loading delay (remove this in actual use)
	onMount(() => {
		let pubkey = localStorage.getItem("pubkey");
		let token = localStorage.getItem("token");
		if (pubkey == null || token == null) {
			const qr = QRCode(0, "L"); // Type number 0 (auto) and error correction level 'L'
			tempToken = new Uint8Array(32);
			window.crypto.getRandomValues(tempToken);
			qr.addData("ff" + buf2hex(tempToken.buffer));
			console.log("ff" + buf2hex(tempToken.buffer));
			qr.make();
			qrCodeDataUrl = qr.createDataURL(12, 0); // Scale 8, margin 0

			let conn = new WebSocket(
				`wss://ln.tejory.io/streamevents?auth=ff${buf2hex(tempToken.buffer)}`,
			);
			conn.onclose = function (evt) {
				// if websocket fails, try to get the tx status from another API
			};
			conn.onmessage = function (evt) {
				var messages = evt.data.split("\n");
				for (var i = 0; i < messages.length; i++) {
					let obj = JSON.parse(messages[i]);
					if (
						obj["pubkey"] != undefined &&
						obj["terminal_name"] != undefined &&
						obj["token"] != undefined
					) {
						localStorage.setItem("pubkey", obj["pubkey"]);
						localStorage.setItem(
							"terminal_name",
							obj["terminal_name"],
						);
						localStorage.setItem("token", obj["token"]);
						conn.close();
						initialized = true;
						setTimeout(() => {
							loading = false;
						}, 1000);
					}
				}
			};
		} else {
			initialized = true;
			setTimeout(() => {
				loading = false;
			}, 3000);
		}
	});
</script>

{#if loading}
	<div
		class="loader item-center absolute z-10 flex h-dvh w-full items-center justify-center bg-white"
		style="background-image:url(/pattern.png);"
	>
		<div
			style="opacity:0.9"
			class="loader item-center absolute z-10 flex h-dvh w-full items-center justify-center bg-neutral-500"
		></div>
		<div
			style="background-image: linear-gradient(to bottom, rgba(255, 0, 0, 0), rgb(0 0 0));"
			class="loader item-center absolute z-10 flex h-dvh w-full items-center justify-center"
		>
			{#if initialized}
				<p class="blinks text-[70px] font-bold">TEJ</p>
				<div class="loads">
					<div class="spinner">
						<img src="loader.png" alt="" />
					</div>
				</div>

				<p class="blinks text-[70px] font-bold">RY</p>
			{:else}
				<div style="display: block" class="px-3">
					<h2 class="rounded bg-white p-2 text-center font-bold">
						This terminal is not initialized
					</h2>
					<div class="my-4 rounded bg-[#ffffffa9] p-2">
						<ul class="list-inside list-disc">
							<li>Go to "Settings" in Tejory Wallet</li>
							<li>Click "Link Terminal"</li>
							<li>Scan this QR code to activate this terminal</li>
						</ul>
					</div>

					<div>
						{#if qrCodeDataUrl}
							<img
								src={qrCodeDataUrl}
								alt="QR Code"
								class="w-full rounded-md border-15 border-white shadow-2xl shadow-black"
							/>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@font-face {
		font-family: "Nexa";
		font-style: normal;
		font-weight: 300;
		src:
			local("Nexa"),
			url("https://fonts.cdnfonts.com/s/16221/NexaLight.woff")
				format("woff");
	}
	@font-face {
		font-family: "Nexa";
		font-style: normal;
		font-weight: 700;
		src:
			local("Nexa"),
			url("https://fonts.cdnfonts.com/s/16221/NexaBold.woff")
				format("woff");
	}

	* {
		font-family: "Nexa";
	}
	.loads {
		transform: translateY(-10px);
	}

	.spinner {
		background-image: url("/loader.png");
		width: 65px;
		height: 65px;
		animation: spin 8s linear infinite;
	}
	.blinks {
		animation: blink 2s;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes blink {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
