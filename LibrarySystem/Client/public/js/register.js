let registerForm = document.getElementById('register-form');
let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');
let accountLink = document.getElementById('Account');

//Here we will hcekc to see if the user is logged in or not and display a welcome message accordingly
document.addEventListener('DOMContentLoaded', async function loginStatus(){
    try{
        await fetch('users/checkLogin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.loggedIn){
                //This assures that if the user is already logged in, we do not append multiple welcome messages
                if(!document.getElementById('userWelcome')){
                    let welcome = document.createElement('h2');
                    welcomeBack.appendChild(welcome);
                    welcome.textContent = `Welcome back, ${data.user}!`;
                    welcome.id = "userWelcome";
                    welcome.className = "Welcome";
                }
                if(loginLink){
                    loginLink.style.visibility = "hidden";
                }
                if(accountLink){
                    accountLink.style.visibility = "visible";
                }
                if(logoutLink){
                    logoutLink.style.visibility = "visible";
                }
            } else {
                if(document.getElementById('userWelcome')){
                    document.getElementById('userWelcome').remove();
                }
                if(loginLink){
                    loginLink.style.visibility = "visible";
                }
                if(accountLink){
                    accountLink.style.visibility = "hidden";
                }
                if(logoutLink){
                    logoutLink.style.visibility = "hidden";
                }
            }
        });
    } catch (error) {
        console.error('Error checking login status:', error);
    }
});

// Here we are going to handle the register form submission
registerForm.addEventListener('submit', async (e) => {
    try {
        //Here we will prevent the default form submission behavior and collect the input data from the register form
    e.preventDefault();
    let formObj = new FormData(registerForm);
    let formData = Object.fromEntries(formObj.entries());

    //This will be used to check if the password and confirm password fields match
    if(formData.password !== formData.confirmPassword){
        alert('Passwords do not match. Please try again.');
        return;
    }


    //We will send the registration data to the server using fetch API to the /users/register endpoint
    await fetch('/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            alert(`${data.message}`);
        } else {
            alert(data.error);
        }
    })
    //At the end of it all we will reset the form and redirect the user to the index page
    registerForm.reset();
    window.location.href = '/indexPage';
    } catch (error) {
        //Here we will handle any erros that occur during form submission and alert the user
        alert('An error occurred while submitting the registration form. Please try again.');
        console.log('Error submitting registration form:', error);
    }
});    