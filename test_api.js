const axios = require('axios');

async function testAPI() {
  console.log('Testing API endpoints...\n');
  
  try {
    // Test 1: All articles
    console.log('1. Testing: GET /api/articles');
    const res1 = await axios.get('http://localhost:3000/api/articles?limit=3');
    console.log(`   ✓ Got ${res1.data.articles.length} articles`);
    console.log(`   First article sport_type: ${res1.data.articles[0].sport_type || 'MISSING'}`);
    
    // Test 2: Filter by Soccer
    console.log('\n2. Testing: GET /api/articles?sportType=Soccer');
    const res2 = await axios.get('http://localhost:3000/api/articles?sportType=Soccer&limit=3');
    console.log(`   ✓ Got ${res2.data.articles.length} articles`);
    if (res2.data.articles.length > 0) {
      console.log(`   First article: ${res2.data.articles[0].title.substring(0, 50)}...`);
      console.log(`   Sport type: ${res2.data.articles[0].sport_type}`);
    }
    
    // Test 3: Filter by American Football
    console.log('\n3. Testing: GET /api/articles?sportType=American Football');
    const res3 = await axios.get('http://localhost:3000/api/articles?sportType=American%20Football&limit=3');
    console.log(`   ✓ Got ${res3.data.articles.length} articles`);
    if (res3.data.articles.length > 0) {
      console.log(`   First article: ${res3.data.articles[0].title.substring(0, 50)}...`);
      console.log(`   Sport type: ${res3.data.articles[0].sport_type}`);
    }
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Make sure the server is running on port 3000');
    }
  }
}

testAPI();
