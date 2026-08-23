//We are get a hold of each of the my account display elements to manipulate the user data that is displayed
let udisplay = document.getElementById('usernameDisplay')
let edisplay = document.getElementById('emailDisplay')
let msdisplay = document.getElementById('memberSinceDisplay')
let books1 = document.getElementById('books1')
let books1Holder = document.getElementById('booksHolder')
let welcomeBack = document.getElementById('welcomeBack')
let finesHolder = document.getElementById('books4')
let overdueHolder = document.getElementById('books2')
let dueSoonHolder = document.getElementById('books3')
let overlaypdf = document.getElementById('overlayPdf') //The overlay for the pdf viewer
let btn = document.createElement('button') //Used for the pdf viewer close button
let pdfPopUp = document.getElementById('pdfPopUp') //This will hold the pdf document for the user to read
let deleteAccountBtn = document.getElementById('deleteAccount') //This will be used to delete the users account


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
//We will use this function to help facilatate the deletion of the user account if the users wants to do so
deleteAccountBtn.addEventListener('click', async () => {
    if(confirm("Are you sure you want to delete your account? This action cannot be undone.")){
        try {
            const response = await fetch('users/deleteAccount', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if(data.success){
                alert("Your account has been deleted successfully.");
                window.location.href = "login"; // Redirect to login page after account deletion
            } else {
                alert("Failed to delete account. Please try again.");
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert("An error occurred while trying to delete your account. Please try again later.");
        }
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
            msdisplay.textContent = timeFixer(data.memberSince) ? timeFixer(data.memberSince) : "None"
        } else if(data.success === 2){
            udisplay.textContent = data.user ? data.user : "None"
            edisplay.textContent = data.email ? data.email : "None"
            msdisplay.textContent = timeFixer(data.memberSince) ? timeFixer(data.memberSince) : "None"
            addYourBooks(data.yourBooks) //Used to insert the books that the user has checked out
            showBooksDueSoon(data.dueSoonBooks); //Used to insert the books that are due soon for the user
        } else if(data.success === 3){
            udisplay.textContent = data.user ? data.user : "None"
            edisplay.textContent = data.email ? data.email : "None"
            msdisplay.textContent = timeFixer(data.memberSince) ? timeFixer(data.memberSince) : "None"
            addYourBooks(data.yourBooks)
            showOverdueBooks(data.yourOverdueBooks);
            showBooksDueSoon(data.dueSoonBooks);
        } else if(data.success === 4){
            udisplay.textContent = data.user ? data.user : "None"
            edisplay.textContent = data.email ? data.email : "None"
            msdisplay.textContent = timeFixer(data.memberSince) ? timeFixer(data.memberSince) : "None"
            addYourBooks(data.yourBooks)
            showOverdueBooks(data.yourOverdueBooks);
            showFines(data.yourFines);
            showBooksDueSoon(data.dueSoonBooks);
        }
    })    
}

async function addYourBooks(books){ 
    books1.innerHTML = ``
    books.forEach(element => {
        //Only adding a read pdf option of the book has a pdf id which would indicate that it has a pdf attached to it
        if(element.pdfId){
                books1.innerHTML += `<section class="account-details" style="margin-top: 20px;">
            <p><strong>Name:</strong> <span>${element.title}</span></p>
            <p><strong>Author:</strong><span>${element.author}</span></p>
            <p><strong>Due Date:</strong><span>${timeFixer(element.dueDate)}</span></p>
            <button class="pdf-button" id="readPdf">Read PDF</button>
             <p style="display: none;" id="isbn">${element.isbn}</p> <!-- We will use this to let our backend system locate the book in question -->
            </section>`
        } else {    
            books1.innerHTML += `<section class="account-details" style="margin-top: 20px;">
        <p><strong>Name:</strong> <span>${element.title}</span></p>
        <p><strong>Author:</strong><span>${element.author}</span></p>
        <p><strong>Due Date:</strong><span>${timeFixer(element.dueDate)}</span></p>
        <p style="display: none;" id="isbn">${element.isbn}</p> <!-- We will use this to let our backend system locate the book in question -->
        </section>`
        }
    });

    readPdfClicker(); //Call the function to set up the pdf viewer
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
      <p><strong>Date Fined:</strong><span>${timeFixer(element.fineDate)}</span></p>
      <p><strong>Due Date:</strong><span>${timeFixer(element.fineDate)}</span></p>
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
      <p><strong>Due Date:</strong><span>${timeFixer(element.dueDate)}</span></p>
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
      <p><strong>Fine Amount:</strong><span>${timeFixer(element.dueDate)}</span></p>
    </section>`
    });
    }
}

//This will help convert our string date into a date that can be dispalyed on the screen for out users to see and witness
function timeFixer(date){
    const reviewDate = new Date(date);

    const formatted = reviewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
    }); 

    return formatted;
}

 //Function will handle the fetch request for the pdf for the books
async function readPdfClicker(){
    if(document.querySelectorAll('.pdf-button')){
        let buttons = document.querySelectorAll('.pdf-button')
        //Adding an event listener for each button
        buttons.forEach(button => {
            button.addEventListener('click', async (e) => {
                pdfPopUp.innerHTML = '' //Make sure to reset the popup section every time a pdf request is made
                //We will use the isbn of the book to get the info on the backend of the system in order to find a pdf match
                let isbnNum = e.target.closest('.account-details').querySelector('#isbn').textContent; //Use this to get the isbn number, we use replace to ensure we get the raw isbn number with no add ons
                let element = document.createElement('div') 
                element.innerHTML = `<iframe src="/users/pdf/${isbnNum}" width="100%" height="600px" style="border:none;" id="pdfViewer"></iframe>` //We will call the route to have the backend directly populate our iframe with the pdf data
                pdfPopUp.appendChild(element) //After, we will add the pdf to our pop up
                btn.innerHTML = `<button id="closePdf" class="closePdf">Close</button>`
                pdfPopUp.appendChild(btn)
                if(!overlaypdf.classList.contains('active')){
                    overlaypdf.classList.add('active'); //This will render the pop up and overlay for us to see and view
                }
                btn.addEventListener('click', closePdfView)
            })
        })
    }
}

async function closePdfView(){
    if(overlaypdf.classList.contains('active')){
        overlaypdf.classList.remove('active')
    }
    btn.removeEventListener('click', closePdfView);
}
