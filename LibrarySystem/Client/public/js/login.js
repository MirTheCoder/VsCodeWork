let loginForm = document.getElementById('login-form');
// Here we are going to handle the login form submission
loginForm.addEventListener('submit', async (e) => {
    try {
        //Here we will prevent the default form submission behavior and collect the input data from the login form
    e.preventDefault();
    let formObj = new FormData(loginForm);
    let formData = Object.fromEntries(formObj.entries());
    //We will send the login data to the server using fetch API to the /users/login endpoint
    await fetch('/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        //We will alert the user based on the response status from the server
        if(response.status === 200){
            alert('Login successful!');
        } else {
            alert('Invalid username or password. Please try again.');
        }
    })
    //At the end of it all we will reset the form and redirect the user to the index page
    loginForm.reset();
    window.location.href = '/indexPage';
    } catch (error) {
        //Here we will handle any erros that occur during form submission and alert the user
        alert('An error occurred while submitting the login form. Please try again.');
        console.log('Error submitting login form:', error);
    }
});    