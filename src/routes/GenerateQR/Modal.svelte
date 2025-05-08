<!-- src/components/Modal.svelte -->
<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	let {
		isOpen,
		message,
		status,
		amountCrypto,
		cryptoSymbol,
		amountFiat,
		fiatSymbol,
		paymentReference,
	} = $props();
	let now = new Date();
	var dateOptions = {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
	};
	var timeOptions = { hour12: true, hour: "2-digit", minute: "2-digit" };
	let terminalName = $state();

	onMount(() => {
		terminalName = localStorage.getItem("terminal_name");
	});

	function closeModal() {
		isOpen = false;
		goto("");
	}
</script>

{#if isOpen}
	<div class="modal-overlay">
		<div class="modal-content">
			<h2
				class={status === "success" ? "text-green-500" : "text-red-500"}
			>
				{status === "success"
					? "Payment Successful!"
					: "Payment Failed"}
			</h2>
			<p>{message}</p>
			<div
				class="my-5 w-full overflow-hidden border-b-2 p-5 text-left"
				style="font-family:'Courier New', Courier, monospace; "
			>
				<div
					class="rtj relative rounded border-1 p-2"
					style="box-shadow: 3px 7px 9px 2px rgb(0 0 0 / 37%)"
				>
					=============================<br />
					&nbsp;&nbsp;&nbsp;Tejory Payment Receipt <br />
					=============================<br />
					<br />
					Payment Successful<br />
					Date: {now.toLocaleDateString("en-US", dateOptions)}<br />
					Time: {now.toLocaleTimeString("en-US", timeOptions)}<br />
					Reference: {paymentReference}<br />
					Terminal: {terminalName}<br />
					=============================<br />
					<br />
					<br />
					Currency: Bitcoin<br />
					Network: Lightning<br />
					Amount (BTC): {amountCrypto.toFixed(8)}<br />
					Amount (PHP): {amountFiat.toFixed(2)}<br />
					<br />
					<br />
					<br />
				</div>
			</div>
			<button onclick={closeModal} class="close-btn">Close</button>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.modal-content {
		background: white;
		padding: 20px;
		border-radius: 10px;
		text-align: center;
		box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
	}
	.close-btn {
		margin-top: 10px;
		padding: 8px 15px;
		background: #333;
		color: white;
		border: none;
		cursor: pointer;
		border-radius: 5px;
	}
	.rtj {
		animation: print 5s linear;
	}
	@keyframes print {
		0% {
			transform: translateY(90%);
		}
		10% {
			transform: translateY(80%);
		}
		20% {
			transform: translateY(76%);
		}
		30% {
			transform: translateY(60%);
		}
		40% {
			transform: translateY(55%);
		}

		50% {
			transform: translateY(0%);
		}
	}
</style>
