
let results = document.getElementById('resultsList')

document.addEventListener('DOMContentLoaded', async () => {
    await fetch('api/getBooks')
    .then(response => response.json())
    .then(data => {
        if(data.success){
            alert("we have found some books, hooray")
        } else {
            alert("No books have been found at all")
        }
    })
    .catch(error => {
        console.log(error)
    })
})



async function imgSources(books){
    console.log(books)
}