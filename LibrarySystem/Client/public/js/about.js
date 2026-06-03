let registerForm = document.getElementById('register-form');
let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');
let accountLink = document.getElementById('Account');




if(logoutLink) {
//This function will handle the logout process if the logout link is clicked
    logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
                await fetch('users/logout', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(async response => {
                    if(response.status === 400){
                        alert('You are not logged in!');
                    } else {
                        return await response.json();
                    }
                })
                .then(data => {
                    if(data.success){
                        alert(`${data.message}`);
                        window.location.href = "indexPage";
                    } else {
                        alert(`${data.message}`);
                    }
                });
});  
}

document.addEventListener('DOMContentLoaded', async function loginStatus(){
    try{
        await fetch('users/checkLogin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.loggedIn){
                //This assures that if the user is already logged in, we do not append multiple welcome messages
                if(!document.getElementById('userWelcome')){
                    let welcome = document.createElement('h2');
                    welcomeBack.appendChild(welcome);
                    welcome.textContent = `Welcome back, ${data.user}!`;
                    welcome.id = "userWelcome";
                    welcome.className = "Welcome";
                }
                if(loginLink){
                    loginLink.style.visibility = "hidden";
                }
                if(accountLink){
                    accountLink.style.visibility = "visible";
                }
                if(logoutLink){
                    logoutLink.style.visibility = "visible";
                }
            } else {
                if(document.getElementById('userWelcome')){
                    document.getElementById('userWelcome').remove();
                }
                if(loginLink){
                    loginLink.style.visibility = "visible";
                }
                if(accountLink){
                    accountLink.style.visibility = "hidden";
                }
                if(logoutLink){
                    logoutLink.style.visibility = "hidden";
                }
            }
        });
    } catch (error) {
        console.error('Error checking login status:', error);
    }
});