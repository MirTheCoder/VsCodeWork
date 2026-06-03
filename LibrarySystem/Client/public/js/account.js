//We are get a hold of each of the my account display elements to manipulate the user data that is displayed
let udisplay = document.getElementById('usernameDisplay')
let edisplay = document.getElementById('emailDisplay')
let msdisplay = document.getElementById('memberSinceDisplay')
let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');
let books1 = document.getElementById('books1')
let books1Holder = document.getElementById('booksHolder')
let welcomeBack = document.getElementById('welcomeBack')
let finesHolder = document.getElementById('books4')
let overdueHolder = document.getElementById('books2')
let dueSoonHolder = document.getElementById('books3')


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
        updateFines();
        accountStatus();
    } catch (error) {
        console.error('Error checking login status:', error);
    }
});

//This function will handle getting the user details for us pertaining to the user who is requesting the details
async function accountStatus(){
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
            dueSoon(data.dueSoonBooks); //Used to insert the books that are due soon for the user
        } else if(data.success === 3){
            udisplay.textContent = data.user ? data.user : "None"
            edisplay.textContent = data.email ? data.email : "None"
            msdisplay.textContent = data.DateCreated ? data.DateCreated : "None"
            addYourBooks(data.yourBooks)
            showOverdueBooks(data.yourOverdueBooks);
            dueSoon(data.dueSoonBooks);
        } else if(data.success === 4){
            udisplay.textContent = data.user ? data.user : "None"
            edisplay.textContent = data.email ? data.email : "None"
            msdisplay.textContent = data.DateCreated ? data.DateCreated : "None"
            addYourBooks(data.yourBooks)
            showOverdueBooks(data.yourOverdueBooks);
            showFines(data.yourFines);
            showBooksDueSoon(data.dueSoonBooks);
        }
    })    
}

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
async function updateFines(){
    await fetch('users/addFine')
    .then(response => response.json())
    .then(data => {
        if(data.success){
            console.log('Fines updated successfully.');
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


//This will allow us tor ender the books that are already overdue
async function showOverdueBooks(books){
if(books.length > 0){
    overdueHolder.innerHTML = ``;
     books.forEach(element => {
        overdueHolder.innerHTML += `<section class="account-details" style="margin-top: 20px;">
      <p><strong>Book Name:</strong> <span>${element.title}</span></p>
      <p><strong>Book Author:</strong><span>${element.author}</span></p>
      <p><strong>Due Date:</strong><span>${new Date(element.dueDate).toLocaleDateString()}</span></p>
    </section>`
    });
    }
}

//This will allow us tor ender the books that are due soon
async function showBooksDueSoon(books){
if(books.length > 0){
    dueSoonHolder.innerHTML = ``;
     books.forEach(element => {
        dueSoonHolder.innerHTML += `<section class="account-details" style="margin-top: 20px;">
      <p><strong>Book Name:</strong> <span>${element.title}</span></p>
      <p><strong>Book Author:</strong><span>${element.author}</span></p>
      <p><strong>Fine Amount:</strong><span>${new Date(element.dueDate).toLocaleDateString()}</span></p>
    </section>`
    });
    }
}