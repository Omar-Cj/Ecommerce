// auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
  
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('https://suuqcasri-production-839407217d71.herokuapp.com/auth/jwt/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
  
        if (!response.ok) {
          throw new Error('Invalid username or password');
        }
  
        const data = await response.json();
        const accessToken = data.access;
  
        // Save the access token (for example, in localStorage)
        localStorage.setItem('accessToken', accessToken);
  
        // Redirect to the dashboard
        window.location.href = 'dashboard.html';
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
      }
    });
  });
  