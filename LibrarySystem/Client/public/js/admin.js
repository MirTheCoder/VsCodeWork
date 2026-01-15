const bookForm = document.getElementById('bookForm');

//This will get the submission of a new book that is added to the database
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let formObj = new FormData(bookForm);
    let formData = Object.fromEntries(formObj.entries());
    //Fetch command to add data to the database for a new book
    try{
        await fetch('/api/addBook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
    } catch(err){
        console.error('Error adding book:', err);
    }
    alert('Book added successfully');
    bookForm.reset();
});