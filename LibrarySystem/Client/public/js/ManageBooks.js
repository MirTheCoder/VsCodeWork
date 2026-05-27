const bookForm = document.getElementById('bookForm');
let results = document.getElementById('resultList')

const closeBtn = document.getElementById("closePopup");
const overlay = document.getElementById("overlay");
const bookEditor = document.getElementById("EditForm");




/*openBtn.addEventListener("click", () => {
  overlay.classList.add("active");
}); */

//This function will handle the edits that admin makes to a specific book's details
function addEditorListener(isbnNum){
    if(bookEditor){
        //We will add the edits if the admin clicks the save button
        bookEditor.addEventListener('submit', async (e, isbnNum) => {
            let formObj = new FormData(bookEditor);
            let formData = Object.fromEntries(formObj.entries());
            formData.append('isbn', isbnNum); //We will append the isbn number to the form data

            await fetch('/api/editBook', {
                method: 'POST',
                body: formObj, // Keep as form data so that multer in the middleware can correctly parse the image and other details
            })
            .then(response => response.json())
            .then(result => {
                if(result.success){
                    alert(result.message);
                    overlay.classList.remove("active");
                } else {
                    alert('Failed to edit book');
                }
            })
            .catch(err => {
                console.error('Error editing book:', err);
            });
        });
    }
}    


closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
});

// If we click outside of the popup box, we will then close it
/* overlay.addEventListener("click", (e) => {
  if (e.target !== overlay) {
    overlay.classList.remove("active");
  }
}); */


//This will get the submission of a new book that is added to the database
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = new FormData(bookForm); // keep it as FormData
  
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
              <p class="book-isbn"><small>ISBN: ${element.isbn}</small></p>
              <div id="admin-buttons">
              <button class="edit-button" id="edit">Edit</button>
              <button class="delete-button" id="delete">Delete</button>
              </div>
          </div>
          `;
          });
          //We will add a option to return a book if the user already has it checked out
      } catch(err){
          console.error("Error rendering books:", err);
      }
  }

  //We will add an event listener to the results list to see if the admin clicks edit or delete on
  //any of the books
  document.querySelector('#resultList').addEventListener('click', async (e) => {
    //We will open the edit pop up screen if the admin selects pop up
        if(e.target.id === 'edit'){
            let isbnNum = e.target.closest('.book-item').querySelector('.book-isbn').value; //Used to get the isbn of the book
            overlay.classList.add("active");
            addEditorListener(isbnNum); // We will add the event listener to the edit form once the popup is open so that we can capture the edits that the admin makes to the book details
        } else if(e.target.id === 'delete'){
            //Used to get the closest book item div class to the delete button that was clicked
            const bookItem = e.target.closest('.book-item');
            //We look for the book title within the book item to see what book we ought to delete
            const bookTitle = bookItem.querySelector('.book-info h3').textContent;
            const bookIsbn = bookItem.querySelector('.book-isbn small').textContent.replace('ISBN: ', ''); //Extracting the ISBN number from the text content
            
            try {
                //fetch command used to delete the book from the database 
                const response = await fetch('/api/deleteBook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title: bookTitle }),
                });
    
                const result = await response.json();
                if(result){
                    alert('result.message');
                }
            } catch (err) {
                console.error('Error deleting book:', err);
            }
        };
  });