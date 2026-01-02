let registerForm = document.getElementById('register-form');
// Here we are going to handle the registration form submission
registerForm.addEventListener('submit', async (e) => {
    try{
    e.preventDefault();
    //Here we are going to collect the input data from the user registration form
    let formObj = new FormData(registerForm);
    let formData = Object.fromEntries(formObj.entries());
    console.log('Submitting registration form with data:', formData);
    alert('Registration form submitted successfully!');
    //Once the data has been successfully submitted, we will reset the form
    registerForm.reset();
    } catch (error) {
        //If any errors occur during form submission, we will catch them here and alert the user
        alert('An error occurred while submitting the registration form. Please try again.');
        console.log('Error submitting registration form:', error);
    }
});    