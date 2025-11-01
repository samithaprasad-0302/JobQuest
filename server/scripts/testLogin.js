const fetch = require('node-fetch');

const testSuperAdminLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@jobquest.com',
        password: 'superadmin123456'
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (data.user) {
      console.log('User role:', data.user.role);
      console.log('Login successful!');
    }
    
  } catch (error) {
    console.error('Login test error:', error);
  }
};

testSuperAdminLogin();