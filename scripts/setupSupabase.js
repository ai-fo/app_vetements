const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test the connection by checking auth
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Connection error:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Session:', data.session ? 'Active session found' : 'No active session');
    return true;
  } catch (err) {
    console.error('Failed to connect:', err.message);
    return false;
  }
}

async function createTestUser() {
  console.log('\nCreating test user...');
  
  const testEmail = 'test@example.com';
  const testPassword = 'Test123!';
  
  try {
    // First, try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('Test user already exists, trying to sign in...');
        
        // Try to sign in instead
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        
        if (signInError) {
          console.error('Sign in error:', signInError.message);
          return false;
        }
        
        console.log('✅ Successfully signed in test user!');
        console.log('User ID:', signInData.user.id);
        
        // Sign out
        await supabase.auth.signOut();
        console.log('✅ Successfully signed out');
        return true;
      } else {
        console.error('Sign up error:', signUpError.message);
        return false;
      }
    }
    
    console.log('✅ Test user created successfully!');
    console.log('User ID:', signUpData.user?.id);
    console.log('Email confirmation required:', !signUpData.user?.email_confirmed_at);
    
    return true;
  } catch (err) {
    console.error('Error:', err.message);
    return false;
  }
}

async function main() {
  console.log('Supabase Setup Script\n');
  
  const connected = await testConnection();
  if (!connected) {
    console.error('\n❌ Failed to connect to Supabase. Please check your credentials.');
    process.exit(1);
  }
  
  await createTestUser();
  
  console.log('\n📝 Test credentials:');
  console.log('Email: test@example.com');
  console.log('Password: Test123!');
  console.log('\n✅ Setup complete! You can now test the login in your app.');
}

main().catch(console.error);