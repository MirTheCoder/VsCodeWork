
let results = document.getElementById('resultList')
let searchBar = document.getElementById('searchBar')
let filterForm = document.getElementById('filterForm')
var searchTerm = ""

document.addEventListener('DOMContentLoaded', async () => {
    fetchBooks()
})

//Function we use to fetch books within our library database
async function fetchBooks(){
    await fetch('/api/getBooks')
    .then(response => response.json())
    .then(async data => {
        if(data.success){
            alert("we have found some books, hooray")
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

//This logic will handle book checkouts and adding the books to the users account
document.querySelector('#checkout').addEventListener('click', async (e) => {
    await fetch('/users/checkLogin')
    .then(response => response.json())
    .then(data => {
        if(!data.loggedIn){
            alert("You must be logged in to checkout a book, please either log in or create an account")
            window.location.href = '/indexPage' //Users will be taken back to the index page if they are not logged in
        }
    })



    let bookTitle = e.target.parentElement.querySelector('[name = "title"]').textContent; // We are using this to find the title belonging to
    //the book that is being check out
    fetch('/users/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application.json'
        },
        body: JSON.stringify({title: bookTitle})
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            alert(`${bookTitle}, has been checked out successfully!`)
        } else {
            alert(`Sorry, there was an error checking out ${bookTitle}, please try again later`)
        }
    })
})

//With this, we will listen for any input changes within the search bar, and will filter based off
//whatever the user input
searchBar.addEventListener('input', async (event) => {
    searchTerm = searchBar.value.trim().toLowerCase();
    fetchBooks()
})



async function imgSources(books){
    let usersBooks = await fetch('/users/currentBooks');
    if(usersBooks.success){
        results.innerHTML = '' //Clear any previous results

    //This will render every book that is found within the database
    try{
        books.forEach(element => {
            //We will only add a checkout button if the user doesn't already have the book checked out
            if(!usersBooks.books.find(book => book.title === element.title)){
            results.innerHTML += `<div class="book-item">
            <div class="book-cover">
                <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
            </div>

            <div class="book-info">
                <h3>${element.title}</h3>
                <p class="author">by ${element.author}</p>
            </div>
            <button class="checkout-button" id='checkout'>Checkout</button>
        </div>
        `;
        //We will add a option to return a book if the user already has it checked out
        } else {
            results.innerHTML += `<div class="book-item">
            <div class="book-cover">
                <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
            </div>

            <div class="book-info">
                <h3 name='title'>${element.title}</h3>
                <p class="author">by ${element.author}</p>
            </div>
            <button class="return-button">Return</button>
        </div>
        `;
        }
        });
    } catch(err){
        console.error("Error rendering books:", err);
    }
    //If user has no books checked out, we will just render all books with checkout buttons
    } else {
        books.forEach(element => {
            results.innerHTML += `<div class="book-item">
            <div class="book-cover">
                <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
            </div>

            <div class="book-info">
                <h3 name='title'>${element.title}</h3>
                <p class="author">by ${element.author}</p>
            </div>
            <button class="checkout-button" id='checkout'>Checkout</button>
        </div>
        `;
        });
    }
}

async function checkBooksByTitle(books){
    //We will display all the books if no filter is present
    if (searchTerm === "" || searchTerm === null){
        await imgSources(books)
    } else {
        //We will use this to only return the books that have the key word/term that the user has typed in.
        let filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTerm));
        await imgSources(filteredBooks)
    }
}