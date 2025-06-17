 // src/routes/some-route/+page.server.ts
   import { redirect } from '@sveltejs/kit';

   export const load = async () => {

     throw redirect(307, '/chat');
   };