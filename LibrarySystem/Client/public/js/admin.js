const bookForm = document.getElementById('bookForm');

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
