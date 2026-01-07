//We are get a hold of each of the my account display elements to manipulate the user data that is displayed
let udisplay = document.getElementById('usernameDisplay')
let edisplay = document.getElementById('emailDisplay')
let msdisplay = document.getElementById('memberSinceDisplay')
let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');

document.addEventListener('DOMContentLoaded', async function accountStatus(){
    fetch('users/details', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}   
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            udisplay.textContent = data.user
            edisplay.textContent = data.email
            msdisplay.textContent = data.memberSince
        }
    })    
}) 

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