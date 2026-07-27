let donateForm = document.getElementById('donateForm')

//This will allow us to get the details of the book that was uploaded
donateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let formData = new FormData(donateForm);
    let formEntries = Object.fromEntries(formData.entries());
    alert('Success in form data retrieval')
})