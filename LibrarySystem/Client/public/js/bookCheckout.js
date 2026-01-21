
let results = document.getElementById('resultList')

document.addEventListener('DOMContentLoaded', async () => {
    await fetch('/api/getBooks')
    .then(response => response.json())
    .then(async data => {
        if(data.success){
            alert("we have found some books, hooray")
            await imgSources(data.books)
        } else {
            alert("No books have been found at all")
            results.innerHTML = '<p>All results will appear here, feel free to use the filters to find a book</p>'
        }
    })
    .catch(error => {
        console.log(error)
    })
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
            <button class="checkout-button">Checkout</button>
        </div>
        `;
        //We will add a option to return a book if the user already has it checked out
        } else {
            results.innerHTML += `<div class="book-item">
            <div class="book-cover">
                <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
            </div>

            <div class="book-info">
                <h3>${element.title}</h3>
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
                <h3>${element.title}</h3>
                <p class="author">by ${element.author}</p>
            </div>
            <button class="checkout-button">Checkout</button>
        </div>
        `;
        });
    }
}