const bookForm = document.getElementById('bookForm');
let results = document.getElementById('resultList')

//This will get the submission of a new book that is added to the database
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = new FormData(bookForm); // 👈 keep it as FormData
  
    try {
      await fetch('/api/addBook', {
          //Do not add headers to ensure that the multer can access the form data accurately
        method: 'POST',
        body: formData, // Keep as form data so that multer in the middleware can correctly parse the image
      });
    } catch (err) {
      console.error('Error adding book:', err);
    }
  
    alert('Book added successfully');
    bookForm.reset();
  });


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
        //We will render all the books in our catalog with edit and delete buttons
          books.forEach(element => {
              results.innerHTML += `<div class="book-item">
              <div class="book-cover">
                  <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
              </div>
  
              <div class="book-info">
                  <h3>${element.title}</h3>
                  <p class="author">by ${element.author}</p>
              </div>
              <button class="edit-button">Edit</button>
              <button class="delete-button">Delete</button>
          </div>
          `;
          });
          //We will add a option to return a book if the user already has it checked out
      } catch(err){
          console.error("Error rendering books:", err);
      }
  }