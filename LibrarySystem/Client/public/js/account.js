//We are get a hold of each of the my account display elements to manipulate the user data that is displayed
let udisplay = document.getElementById('usernameDisplay')
let edisplay = document.getElementById('emailDisplay')
let msdisplay = document.getElementById('memberSinceDisplay')
let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');
let books1 = document.getElementById('bookBag')
let books1Holder = document.getElementById('booksHolder')
let welcomeBack = document.getElementById('welcomeBack')


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
                    welcomeBack.innerHTML = ``;
                    let welcome = document.createElement('h2');
                    welcomeBack.appendChild(welcome);
                    welcome.textContent = `Welcome back, ${data.user}!`;
                    welcome.id = "userWelcome";
                    welcome.className = "Welcome";
                }
                if(loginLink){
                    loginLink.style.visibility = "hidden";
                }
                if(logoutLink){
                    logoutLink.style.visibility = "visible";
                }
            } else {
                if(document.getElementById('userWelcome')){
                    document.getElementById('userWelcome').remove();
                }
                window.location.href = "login" //If the user is not logged in, then we will send them to the login page
            }
        });
    } catch (error) {
        console.error('Error checking login status:', error);
    }
});

document.addEventListener('DOMContentLoaded', async function accountStatus(){
    fetch('users/details', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}   
    })
    .then(response => response.json())
    .then(data => {
        if(data.success === 1){
            udisplay.textContent = data.user ? data.user : "None"
            edisplay.textContent = data.email ? data.email : "None"
            msdisplay.textContent = data.DateCreated ? data.DateCreated : "None"
        } else if(data.success === 2){
            udisplay.textContent = data.user ? data.user : "None"
            edisplay.textContent = data.email ? data.email : "None"
            msdisplay.textContent = data.DateCreated ? data.DateCreated : "None"
            addYourBooks(data.yourBooks) //Used to insert the books that the user has checked out
        } else if(data.success === 3){
            udisplay.textContent = data.user ? data.user : "None"
            edisplay.textContent = data.email ? data.email : "None"
            msdisplay.textContent = data.DateCreated ? data.DateCreated : "None"
            addYourBooks(data.yourBooks)
        }
    })    
}) 

async function addYourBooks(books){ 
    books1.innerHTML = ``
    books.forEach(element => {
        books1.innerHTML += `<section class="account-details" style="margin-top: 20px;">
      <p><strong>Name:</strong> <span>${element.title}</span></p>
      <p><strong>Author:</strong><span>${element.author}</span></p>
      <p><strong>Due Date:</strong><span>${new Date(element.dueDate).toLocaleDateString()}</span></p>
    </section>`
    });
}