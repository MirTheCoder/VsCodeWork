let results = document.getElementById('bookResults');
let seeReviews = document.getElementById('seeReviews');
let addReviewOverlay = document.getElementById('overlay');
let closeAddReview = document.getElementById('closePopup');

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
                <button class="add-button" id="edit">Add Review</button>
                <button class="see-button" id="delete">See Review</button>
              </div>
          </div>
          `;
          });

          //We will make sure to add listeners to the add review buttons and see reviews buttons
          addButtonListeners()
          seeButtonListeners()
          //We will add a option to return a book if the user already has it checked out
      } catch(err){
          console.error("Error rendering books:", err);
      }
  }

async function addButtonListeners(){
    //We first want to make sure that there is at least one add review button available on our page
    if(document.querySelectorAll('.add-button')){
        let addList = document.querySelectorAll('.add-button')
        addList.forEach(button => {
            button.addEventListener('click', async (e) => {
                let isbn = e.target.closest(".book-item").querySelector('small').textContent.trim().replace("ISBN: ", ''); //Gets us the isbn of the book corresponding to the add review button that was clicked
                try{
                    //First we have to get the book that the user is reviewing so that we can tie its title and isbn tot he review
                    const response = await fetch('/users/currentBooks', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ "isbn": isbn })
                    });
                    let data = await response.json()
                    if(data.success){
                        alert("It worked")
                    } else {
                        alert("it did not work")
                    }

                    if(!addReviewOverlay.classList.contains('active')){
                        addReviewOverlay.classList.add('active');
                    }
                    closeAddReview.addEventListener('click', closeTheOverlay);

                } catch(err){
                    console.log("An issue occured while trying to save your review, please try again: ", err)
                }
            })
        })
    }    
}

async function seeButtonListeners(){
    //We first want to make sure that there is at least one see review button available on our page
        if(document.querySelectorAll('.see-button')){
            let addList = document.querySelectorAll('.see-button')
            addList.forEach(button => {
                button.addEventListener('click', (e) => {
                    alert('you clicked a see button')
                })
            })
        }
}

async function closeTheOverlay(){
    if(addReviewOverlay.classList.contains('active')){
        addReviewOverlay.classList.remove('active');
    }
    closeAddReview.removeEventListener('click', closeTheOverlay) //We want to make sure that there are no event listeners straggling around, only have it when necessary
}