let donateForm = document.getElementById('donateForm')

//This will allow us to get the details of the book that was uploaded
donateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let formData = new FormData(donateForm);
    try {
      await fetch('/api/addBookDonation', {
          //Do not add headers to ensure that the multer can access the form data accurately
        method: 'POST',
        body: formData, // Keep as form data so that multer in the middleware can correctly parse the image
      });
    } catch (err) {
      console.error('Error adding book:', err);
    }
})