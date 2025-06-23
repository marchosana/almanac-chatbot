<script lang="ts">
  let feedbacks: { message: string; created: string }[] = [];
  let error = '';
  let loading = true;

  async function loadFeedback() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/feedback');
      if (!res.ok) throw new Error('Failed to load feedback');
      feedbacks = await res.json();
    } catch (e) {
      error = 'Could not load feedback.';
    } finally {
      loading = false;
    }
  }

  loadFeedback();
</script>

<div class="max-w-2xl mx-auto p-6">
  <div class="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">This page lists all user feedback.</div>
  <h1 class="text-2xl font-bold mb-4">User Feedback</h1>
  {#if loading}
    <div>Loading...</div>
  {:else if error}
    <div class="text-red-600">{error}</div>
  {:else if feedbacks.length === 0}
    <div>No feedback yet.</div>
  {:else}
    <ul class="space-y-4">
      {#each feedbacks as fb}
        <li class="p-4 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <div class="text-gray-800 dark:text-gray-100">{fb.message}</div>
          <div class="text-xs text-gray-500 mt-2">{new Date(fb.created).toLocaleString()}</div>
        </li>
      {/each}
    </ul>
  {/if}
</div> 