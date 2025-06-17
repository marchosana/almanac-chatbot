<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  
  const { data } = $props<{ data: ActionData }>();
  
  let messages = $state<{ role: 'user' | 'assistant'; content: string }[]>([]);
  let inputMessage = $state('');
  let isLoading = $state(false);

  let isDarkMode = $state(false);

  // Initialize dark mode from localStorage or system preference
  $effect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDarkMode = true;
    }
  });

  // Update localStorage and apply/remove 'dark' class
  $effect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  });

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const form = (event.target as HTMLElement).closest('form');
      if (form) form.requestSubmit();
    }
  }
</script>

<div class="flex flex-col h-screen bg-[#F2F2F7] dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200">
  <!-- Header -->
  <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
    <div class="w-8"></div> 
    <h1 class="text-lg font-semibold">FUTURE FUTURESCAPER from 2040</h1>
    <button on:click={toggleDarkMode} class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
      {#if isDarkMode}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.325 3.325l-.707.707M5.372 5.372l-.707.707M18.628 5.372l.707.707M5.372 18.628l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9.003 0 008.354-5.646z" />
        </svg>
      {/if}
    </button>
  </div>

  <!-- Messages Container -->
  <div class="flex-1 overflow-y-auto px-4 py-6 space-y-3">
    {#each messages as message}
      <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[75%] px-4 py-2.5 shadow-sm {
          message.role === 'user' 
            ? 'bg-[#007AFF] text-white rounded-3xl rounded-br-md' 
            : 'bg-[#E9E9EB] dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-3xl rounded-bl-md'
        }">
          <p class="text-[15px] leading-[1.3] whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    {/each}
    {#if isLoading}
      <div class="flex justify-start">
        <div class="bg-[#E9E9EB] dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-3xl rounded-bl-md px-4 py-2.5 shadow-sm">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Input Area -->
  <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
    <form
      method="POST"
      use:enhance={({ formData }) => {
        const message = formData.get('message') as string;
        if (!message) return;

        // Append current messages history to formData
        formData.append('conversationHistory', JSON.stringify(messages));

        messages = [...messages, { role: 'user', content: message }];
        inputMessage = '';
        isLoading = true;

        return async ({ result }) => {
          console.log('Form result:', result);
          isLoading = false;

          if (result.type === 'success') {
            try {
              if (result.data?.success && typeof result.data.data === 'string') {
                messages = [...messages, { role: 'assistant', content: result.data.data }];
              } else {
                console.error('Unexpected response format:', result.data);
                messages = [...messages, { 
                  role: 'assistant', 
                  content: 'Sorry, I received an unexpected response format.' 
                }];
              }
            } catch (e) {
              console.error('Error processing response:', e);
              messages = [...messages, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error processing the response.' 
              }];
            }
          } else {
            console.error('Error:', result);
            messages = [...messages, { 
              role: 'assistant', 
              content: 'Sorry, I encountered an error. Please try again.' 
            }];
          }
        };
      }}
      class="flex items-center space-x-3"
    >
      <div class="flex-1 bg-[#F2F2F7] dark:bg-gray-700 rounded-2xl px-4 py-1.5">
        <textarea
          bind:value={inputMessage}
          on:keydown={handleKeydown}
          name="message"
          placeholder="iMessage"
          class="w-full resize-none bg-transparent focus:outline-none text-[15px] leading-[1.3] border-none ring-0 focus:shadow-none focus:border-transparent focus:ring-transparent"
          rows="1"
        ></textarea>
      </div>
      <button
        type="submit"
        class="bg-[#007AFF] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !inputMessage.trim()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </form>
  </div>
</div>

<style>
  textarea {
    min-height: 24px;
    max-height: 120px;
  }
  
  /* Custom scrollbar for webkit browsers */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #C7C7CC;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #AEAEB2;
  }

  textarea:focus {
    outline: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
  }
</style> 