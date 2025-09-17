// This runs immediately when the script is loaded

console.log('Home Script loaded!');
var token = localStorage.getItem('user_email');
if (token) {
    console.log('User email from localStorage:', token  );
}