<script lang="ts">
	import { getAuth } from "@micro-stacks/svelte";
 
	const auth = getAuth();
	$: label = $auth.isRequestPending
		? "Loading..."
		: $auth.isSignedIn
			? "Sign out"
			: "Connect Stacks wallet";
 
	function click()
		{
		if ($auth.isSignedIn)
			$auth.signOut();
		else
			$auth.openAuthRequest();
		}
</script>
 
<button on:click={click}>
	{label}
</button>