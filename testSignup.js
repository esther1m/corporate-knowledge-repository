require('./httpsPatch');

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = ' https://mirqyoapycmocdgoqhaf.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcnF5b2FweWNtb2NkZ29xaGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgzNjgyMSwiZXhwIjoyMDcwNDEyODIxfQ.Wi56nxpd2md567-102AfFvHmpUr3-NK-ePLZU0XSegM';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

(async () => {
  console.log('Attempting signup...');
  const { data, error } = await supabase.auth.signUp({
    email: 'elizabeth@gmail.com',
    password: 'securePassword123'
  });

  if (error) {
    console.error('Signup failed:', error.message);
  } else {
    console.log('Signup success:', data);
  }
})();
