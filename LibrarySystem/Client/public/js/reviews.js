let results = document.getElementById('bookResults');
let seeReviews = document.getElementById('seeReviews');
let addReviewOverlay = document.getElementById('overlay');
let closeAddReview = document.getElementById('closePopup');
let AddReviewPanel = document.getElementById('addReviewPanel')
let reviewForm = document.getElementById('reviewForm');

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
                    const response = await fetch('/api/getABook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ "isbn": isbn })
                    });
                    let data = await response.json()
                    if(data.success){
                        let book = data.book
                        alert("It worked")
                        AddReviewPanel.innerHTML = `
                            <h4>${book.title}</h4>
                            <h5>by ${book.author}</h5>
                            <p>Your Review</p>
                            <textarea rows="42" cols="43" placeholder="Write Your Review Here" class="reviewBox" name="reviewText" required></textarea>
                        `
                        //Now we will add a listener to the review form so that we can save the review if the user submits a review
                        reviewForm.addEventListener('submit', (e) => saveReview(e, book));
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

//This function will handle the logic that renders the list of reviews for a book in order for users to see it
async function seeButtonListeners(){
    //We first want to make sure that there is at least one see review button available on our page
        if(document.querySelectorAll('.see-button')){
            let addList = document.querySelectorAll('.see-button')
            addList.forEach(button => {
                button.addEventListener('click', async (e) => {
                    alert('you clicked a see button')
                    //First we get the isbn of the book that the user requested to see the reviews for
                    let isbn = e.target.closest(".book-item").querySelector('small').textContent.trim().replace("ISBN: ", '')
                    try {
                     const response = await fetch('/api/getABook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ "isbn": isbn })
                    });

                    let data = await response.json();
                    let element = data.book
                    
                    //We will render the image of the book along with its title, author name, and the reviews that follow it as well
                    seeReviews.innerHTML = `<div class="book-item">
                        <div class="book-cover">
                            <img src="/api/getImage/${encodeURIComponent(element.title)}" alt="${element.title}"> <!-- Encoding the title to ensure special characters are handled correctly -->
                        </div>
  
                        <div class="book-info">
                            <h3>${element.title}</h3>
                            <p class="author">by ${element.author}</p>
                        </div>
                        </div>
                    `
                    } catch(err){
                        alert("An error occured while trying to get the book details")
                        console.log("Error: ", err)
                    }

                    try{
                    //Next we want to use this to get the actual reviews for the book in question
                    let result = await fetch('/api/getReviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ "isbn": isbn })
                    });

                    let data = await result.json()
                    if(data.success){
                        alert("We got the reviews, Hooray")
                        if(data.reviews.length > 0){
                            let reviewList = data.reviews
                            reviewList.forEach(review => {
                                let reviewSect = document.createElement('div')
                                reviewSect.innerHTML = `<p>${review.reviewContent}</p>`
                                seeReviews.appendChild(reviewSect)
                            })

                        } else {
                            //If no reviews for the book, we will have a message saying so
                            let reviewSect = document.createElement('div')
                            reviewSect.innerHTML = `<h2>There are no reviews for this book currently, check back later to see if any reviews pop up</h2>`
                            seeReviews.appendChild(reviewSect)
                        }
                    }

                    if(seeReviews.classList.contains('hide')){
                        seeReviews.classList.remove('hide');
                    }
                    } catch(err) {
                        alert("An Error occured whiled trying to retrieve the reviews ")
                        console.log("Error: ", err)
                    } 
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

//This will handle the process of saving the review for us
async function saveReview(e, book){
    e.preventDefault();
    try{
        let formData = new FormData(reviewForm)
        let formDetails = Object.fromEntries(formData.entries());
        let reviewData = {
                "content": formDetails.reviewText, //Store the text thhe user wrote regarding the book
                "isbn": book.isbn,
                "title": book.title
        }
        //We will push all our data that is relevant to the users review to the backend to save the review accuratley
        const response = await fetch('/api/saveReview', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(reviewData)
                    });
        let data = await response.json();

        //Check to see if the save was successful before we make our next action
        if(data.success){
            alert(data.message)
        } else {
            alert(data.message)
        }
    } catch(err){
        alert('It did not work due to an error')
        console.log("Error: ", err)
    }    
}