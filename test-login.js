// Test script to simulate the login flow
const baseUrl = 'http://192.168.15.22:3000';
const apiKey = '9c5017e582f3bddd4ebd5f97a6f68f3eda749248';

async function testLogin() {
  console.log('Testing Kanban Redmine Login...\n');
  console.log('Step 1: Testing Redmine API connection');
  console.log(`URL: ${baseUrl}`);
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  
  try {
    const response = await fetch(`${baseUrl}/projects.json`, {
      headers: {
        'X-Redmine-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`\n❌ Login Failed!`);
      console.error(`Status: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`Response: ${text.substring(0, 200)}`);
      return false;
    }

    const data = await response.json();
    console.log(`\n✅ Login Successful!`);
    console.log(`\nStep 2: Fetched projects from Redmine`);
    console.log(`Total projects: ${data.projects?.length || 0}`);
    
    if (data.projects && data.projects.length > 0) {
      console.log(`\nAvailable projects:`);
      data.projects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.name} (ID: ${project.id})`);
      });
    }

    console.log(`\n✅ Test Complete: Login would succeed and redirect to /projects page`);
    console.log(`\nExpected Flow:`);
    console.log(`  1. User enters credentials on http://localhost:5173`);
    console.log(`  2. Click "Войти" button`);
    console.log(`  3. App validates credentials by fetching projects`);
    console.log(`  4. Credentials saved to localStorage`);
    console.log(`  5. Redirect to /projects (Project Picker Page)`);
    console.log(`  6. User selects a project`);
    console.log(`  7. Redirect to /board (Kanban Board Page)`);
    
    return true;
  } catch (error) {
    console.error(`\n❌ Login Failed!`);
    console.error(`Error: ${error.message}`);
    
    if (error.cause) {
      console.error(`Cause: ${error.cause.message}`);
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error(`\nThe Redmine server at ${baseUrl} is not accessible.`);
      console.error(`Please check:`);
      console.error(`  - Is the Redmine server running?`);
      console.error(`  - Is the URL correct?`);
      console.error(`  - Can you access it from this machine?`);
    } else if (error.message.includes('fetch')) {
      console.error(`\nNetwork error occurred. Please check your connection.`);
    }
    
    return false;
  }
}

// Run the test
testLogin().then(success => {
  process.exit(success ? 0 : 1);
});
