let welcome1 = document.getElementById('w1');
let welcome2 = document.getElementById('w2');
let welcome3 = document.getElementById('w3');
let welcomeBack = document.getElementById('welcomeBack');

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
            } else {
                if(document.getElementById('userWelcome')){
                    document.getElementById('userWelcome').remove();
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
});

welcome2.addEventListener('click', () => {
    alert("You choose to click to see Reviews on your favorite books!");
});

welcome3.addEventListener('click', () => {
    alert("You choose to click to donate a book (pdf only)!");
});   