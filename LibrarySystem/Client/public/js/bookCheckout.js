
let results = document.getElementById('resultList')
let searchBar = document.getElementById('searchBar')
let filterForm = document.getElementById('filterForm')
var searchTerm = ""
let searchButton = document.getElementById('searchButton')
let overlaypdf = document.getElementById('overlay')
let btn = document.createElement('button');// global btn that we will use to close the pdf viewer
let pdfPopUp = document.getElementById('pdfPopUp') //This is where we will render our pdf
//This will reset our event listeners so that we don't have duplicate event listeners for the same buttons
//If they happened to be rendered multiple times at one time for some reason
document.addEventListener('DOMContentLoaded', async () => {
    //We will make sure to remove any previous event listeners from the checkout
    //or return buttons before adding new ones
    let buttons = document.querySelectorAll('.checkout-button');
    if(buttons.length > 0){ 
        buttons.forEach(button => {
            button.removeEventListener('click', checkOutBook);
        });
    }
    
    let returns = document.querySelectorAll('.return-button');
    if(returns.length > 0){ 
        try{
        returns.forEach(button => {
            button.removeEventListener('click', returnBook);
        });
    } catch(err){
        console.error("Error removing return button event listeners: ", err);
    }
    }  
    fetchBooks() // we will use this to fetch all the books in the database  
})


//Function we use to fetch books within our library database
async function fetchBooks(){
    await fetch('/api/getBooks')
    .then(response => response.json())
    .then(async data => {
        if(data.success){
            await checkBooksByTitle(data.books) //Used to check and see if the user is trying to filter through the books
        } else {
            alert("No books have been found at all")
            results.innerHTML = '<p>All results will appear here, feel free to use the filters to find a book</p>'
        }
    })
    .catch(error => {
        console.log(error)
    })
}





//With this, we will listen for any input changes within the search bar, and will filter based off
//whatever the user input
searchButton.addEventListener('click', async (event) => {
    searchTerm = searchBar.value.trim().toLowerCase();
    fetchBooks()
})



async function imgSources(books){
    if(books.length === 0){
        alert("No books have been found with that title")
        return; //If no books are found then will will just end the function here
    }  
    alert("we have found some books, hooray")
    let usersBooks = await fetch('/users/currentBooks');
    usersBooks = await usersBooks.json() //We are gonna parse the users books here
    if(usersBooks.success){
        results.innerHTML = '' //Clear any previous results

    //This will render every book that is found within the database
    try{
        //Do something about the checkout rendering if a book has already been checked out
        books.forEach(element => {
            //We will only add a checkout button if the user doesn't already have the book checked out
            if(!usersBooks.books.find(book => book.title === element.title)){
            results.innerHTML += `<div class="book-item">
            <div class="book-cover">
                <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
            </div>

            <div class="book-info">
                <h3>${element.title}</h3>
                <p class="author" name="author">${element.author}</p>
            </div>
            <p style="display: none;" name="isbn">${element.isbn}</p> <!-- We want to add isbn to each book without displaying the isbn -->
            ${element.available ? `<p><small>Availability: available </small></p>` : `<p><small>Availability: unavailable </small></p>`} <!-- Allows us to properly render results based off of whether or not the book is truly available -->
            <button class="checkout-button">Checkout</button>
        </div>
        `;
        //We will add a option to return a book if the user already has it checked out
        } else {
            if(element.pdfId){
                results.innerHTML += `<div class="book-item">
                <div class="book-cover">
                    <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
                </div>

                <div class="book-info">
                    <h3 name='title'>${element.title}</h3>
                    <p class="author">${element.author}</p>
                </div>
                <p style="display: none;" name="isbn">${element.isbn}</p> <!-- We want to add isbn to each book without displaying the isbn -->
                <div class="sideBySide">
                    <button class="buddy-button">Return</button>
                    <button class="pdf-button">Read Pdf</button> 
                </div>
            </div>
            `;
            } else {
                results.innerHTML += `<div class="book-item">
                <div class="book-cover">
                    <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
                </div>

                <div class="book-info">
                    <h3 name='title'>${element.title}</h3>
                    <p class="author">${element.author}</p>
                </div>
                <p style="display: none;" name="isbn">${element.isbn}</p> <!-- We want to add isbn to each book without displaying the isbn -->
                <button class="return-button">Return</button>
            </div>
            `;
            } 
        }
        });
        checkOutBook() //We are calling the function here to make sure that the event listeners
        //are added after the checkout buttons are rendered on the page
        returnBook() //We are calling this function here to make sure that the event listeners for the return buttons are added after they are rendered on the page
        readPdfClicker() //This function will add event listeners on all the read pdf buttons in case their are any read pdf buttons
    } catch(err){
        console.error("Error rendering books:", err);
    }
    //If user has no books checked out, we will just render all books with checkout buttons
    } else {
        results.innerHTML = ``
        try{
            books.forEach(element => {
                results.innerHTML += `<div class="book-item">
                <div class="book-cover">
                    <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
                </div>

                <div class="book-info">
                    <h3 name='title'>${element.title}</h3>
                    <p class="author">${element.author}</p>
                </div>
                <p style="display: none;" name="isbn">${element.isbn}</p> <!-- We want to add isbn to each book without displaying the isbn -->
                ${element.available ? `<p><small>Availability: available </small></p>` : `<p><small>Availability: unavailable </small></p>`} <!-- Allows us to properly render results based off of whether or not the book is truly available -->
                <button class="checkout-button" id='checkout'>Checkout</button>
            </div>
            `;
            });
            checkOutBook() //Calling this function to make sure we add the event listeners only after everything renders
            returnBook() //We are calling this function here to make sure that the event listeners for the return buttons are added after they are rendered on the page, even though in this case there won't be any return buttons rendered since the user has no books checked out
        } catch(err){
            console.error("Error rendering books:", err);
        }
    }    
}

async function checkBooksByTitle(books){
    //We will display all the books if no filter is present
    //We trim the search to ensure that we are not comparing white spaces
    if (searchTerm.trim() === "" || searchTerm === null){
        await imgSources(books)
    } else {
        //We will use this to only return the books that have the key word/term that the user has typed in.
        let filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTerm.trim()));
        await imgSources(filteredBooks)
    }
}

//This will handle checking out books to our users, we will add event listeners to each checkout button that is rendered
function checkOutBook(){
    let buttons = document.querySelectorAll('.checkout-button');
    let isLoggedIn = false //This will be our checker to see whether or not a usser is logged in
    //before we proceeed with the act of checking out a book for them

    if(buttons.length > 0){ 
        buttons.forEach(button => {
            button.addEventListener('click', async (e) => {

                await fetch('/users/checkLogin')
                .then(response => response.json())
                .then(data => {
                    if(!data.loggedIn){
                        alert("You must be logged in to checkout a book");
                        isLoggedIn = false
                        window.location.href = '/indexPage';
                    } else {
                        isLoggedIn = true
                    }
                });
                
                //We will check out the book only if the user is logged in
                if(isLoggedIn){
                let bookTitle = e.target.parentElement.querySelector('h3').textContent;
                let bookAuthor = e.target.parentElement.querySelector('.author').textContent;
                let bookISBN = e.target.parentElement.querySelector('p[name="isbn"]').textContent;

                fetch('/users/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: bookTitle,
                        author: bookAuthor,
                        isbn: bookISBN
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if(data.success){
                        alert(`${bookTitle} has been checked out successfully!`);
                        window.location.reload()
                    } else {
                        alert(`Error checking out ${bookTitle}`);
                    }
                });
            }

            });
        });

    }
}

//This will be used to allow users to return books that they have checked out
function returnBook(){
let returns = document.querySelectorAll('.return-button');
    if(returns.length > 0){ 
        returns.forEach(button => {
            button.addEventListener('click', async(e) => {
                try{
                //We need to first make sure that the user is first logged in before we allow
                //them to return a book
                await fetch('/users/checkLogin')
                .then(response => response.json())
                .then(data => {
                    if(!data.loggedIn){
                        alert("You must be logged in to checkout a book");
                        window.location.href = '/indexPage';
                    }
                });

                let bookISBN = e.target.parentElement.querySelector('p[name="isbn"]').textContent; //Use this to get the isbn number
                await fetch('/users/returnBook', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ isbn: bookISBN})
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message) //This will let the user know the results of their return attempt
                })
                window.location.reload() //This will reload the page for us so that we can see the up to date results after the user has made a return action 
            } catch(err){
                console.error("Error returning book: ", err);
            }
            })
        });
    }  
}   

async function closePdfView(){
    if(overlaypdf.classList.contains('active')){
        overlaypdf.classList.remove('active')
    }
    btn.removeEventListener('click', closePdfView);
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
                let bookISBN = e.target.closest('.book-item').querySelector('p[name="isbn"]').textContent; //Use this to get the isbn number
                let element = document.createElement('div') 
                element.innerHTML = `<iframe src="/users/pdf/${bookISBN}" width="100%" height="600px" style="border:none;" id="pdfViewer"></iframe>` //We will call the route to have the backend directly populate our iframe with the pdf data
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