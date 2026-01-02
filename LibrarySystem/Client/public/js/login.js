let loginForm = document.getElementById('login-form');
// Here we are going to handle the login form submission
loginForm.addEventListener('submit', async (e) => {
    try {
        //Here we will prevent the default form submission behavior and collect the input data from the login form
    e.preventDefault();
    let formObj = new FormData(loginForm);
    let formData = Object.fromEntries(formObj.entries());
    console.log('Submitting login form with data:', formData);
    alert('Login form submitted successfully!');
    loginForm.reset();
    } catch (error) {
        //Here we will handle any erros that occur during form submission and alert the user
        alert('An error occurred while submitting the login form. Please try again.');
        console.log('Error submitting login form:', error);
    }
});    