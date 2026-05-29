//We are get a hold of each of the my account display elements to manipulate the user data that is displayed
let udisplay = document.getElementById('usernameDisplay')
let edisplay = document.getElementById('emailDisplay')
let msdisplay = document.getElementById('memberSinceDisplay')
let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');
let books1 = document.getElementById('bookBag')
let books1Holder = document.getElementById('booksHolder')
let welcomeBack = document.getElementById('welcomeBack')
let finesHolder = document.getElementById('theFines')


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
        updateDetails();
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

//This will have our system check to see if any fines need to be added to hte users account
function updateFines(){
    await fetch('books/addFine')
    .then(response => response.json())
    .then(data => {
        if(data.success){
            await showFines(data.fines); //We will use this to display all of the users fines
        }
    })
}

//This function will display all of the users fines in a readable format
async function showFines(fines){
    if(fines.length > 0){
    finesHolder.innerHTML = ``;
     fines.forEach(element => {
        finesHolder.innerHTML += `<section class="account-details" style="margin-top: 20px;">
      <p><strong>Book Name:</strong> <span>${element.bookTitle}</span></p>
      <p><strong>Book Author:</strong><span>${element.bookAuthor}</span></p>
      <p><strong>Fine Amount:</strong><span>${element.amount}</span></p>
      <p><strong>Date Fined:</strong><span>${new Date(element.fineDate).toLocaleDateString()}</span></p>
      <p><strong>Due Date:</strong><span>${new Date(element.dueDate).toLocaleDateString()}</span></p>
    </section>`
    });
    }
}