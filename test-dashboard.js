// Test Dashboard API
const testDashboard = async () => {
  try {
    console.log('🧪 Testing Dashboard API...');
    
    const response = await fetch('http://localhost:3000/api/dashboard', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dashboard API Response:');
      console.log('  - Repos:', data.repos?.length || 0);
      console.log('  - Recent Runs:', data.recentRuns?.length || 0);
      console.log('  - Stats:', data.stats || {});
      if (data.error) {
        console.log('  - Warning:', data.error);
      }
    } else {
      const error = await response.text();
      console.log('❌ Dashboard API Error:', error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testDashboard();
