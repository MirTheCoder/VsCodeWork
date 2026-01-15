
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
    results.innerHTML = '' //Clear any previous results

    //This will render every book that is found within the database
    try{
        books.forEach(element => {
            results.innerHTML += `<div class="book-item">
            <div class="book-cover">
                <img src="/api/getImage/${element.title}" alt="${element.title}">
            </div>

            <div class="book-info">
                <h3>${element.title}</h3>
                <p class="author">by ${element.author}</p>
            </div>
        </div>
        `;
        });
    } catch(err){
        console.error("Error rendering books:", err);
    }
}