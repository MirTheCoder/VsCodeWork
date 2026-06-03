let welcome1 = document.getElementById('w1');
let welcome2 = document.getElementById('w2');
let welcome3 = document.getElementById('w3');
let welcomeBack = document.getElementById('welcomeBack');
let welcome4 = document.getElementById('w4');
let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');
let accountLink = document.getElementById('Account');

//Here we will hcekc to see if the user is logged in or not and display a welcome message accordingly
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



// Adding event listeners to trigger respective acts when clicked
welcome1.addEventListener('click', () => {
    alert("You choose to click to choose from a variety of books!");
    window.location.href = "bookCheckout";
});

welcome2.addEventListener('click', () => {
    alert("You choose to click to see Reviews on your favorite books!");
});

welcome3.addEventListener('click', () => {
    alert("You choose to click to donate a book (pdf only)!");
});   


//When this is clicked, it will take the user to the admin page
welcome4.addEventListener('click', async () => {
    alert("You choose to click to go to the Admin Page (for admins only)!");
    window.location.href = "admin";
});


//This is needed to avoid errors if the logout link is not present on the page
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
              