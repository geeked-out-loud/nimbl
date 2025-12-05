#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('🔧 Testing Supabase connection...\n');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseKey.substring(0, 20)}...\n`);

  try {
    // Test 1: Query forms table
    console.log('✓ Test 1: Checking forms table...');
    const { data: forms, error: formsError } = await supabase
      .from('forms')
      .select('*')
      .limit(1);

    if (formsError) throw formsError;
    console.log('  ✅ forms table exists and is accessible\n');

    // Test 2: Query responses table
    console.log('✓ Test 2: Checking responses table...');
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .limit(1);

    if (responsesError) throw responsesError;
    console.log('  ✅ responses table exists and is accessible\n');

    // Test 3: Query users table
    console.log('✓ Test 3: Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) throw usersError;
    console.log('  ✅ users table exists and is accessible\n');

    // Test 4: Insert test form
    console.log('✓ Test 4: Testing insert (creating test form)...');
    const { data: newForm, error: insertError } = await supabase
      .from('forms')
      .insert([
        {
          owner_id: 'test-user-123',
          title: 'Test Form',
          slug: 'test-form-' + Date.now(),
          description: 'This is a test form',
          components: [],
          published: false,
        },
      ])
      .select();

    if (insertError) throw insertError;
    console.log('  ✅ Successfully created test form\n');
    console.log(`  Form ID: ${newForm[0].id}\n`);

    console.log('==================================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('==================================================');
    console.log('\nYour Supabase connection is working correctly.');
    console.log('You can now proceed with development.');

  } catch (error) {
    console.log('==================================================');
    console.log('❌ TEST FAILED');
    console.log('==================================================\n');
    console.log('Error:', error.message || error);
    console.log('\nPossible issues:');
    console.log('1. Credentials in .env.local are wrong');
    console.log('2. Database schema not created yet');
    console.log('3. Supabase project is not accessible\n');
    process.exit(1);
  }
}

runTests();