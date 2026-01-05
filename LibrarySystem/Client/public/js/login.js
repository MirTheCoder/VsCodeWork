let loginForm = document.getElementById('login-form');

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
            } else {
                if(document.getElementById('userWelcome')){
                    document.getElementById('userWelcome').remove();
                }
            }
        });
    } catch (error) {
        console.error('Error checking login status:', error);
    }
});

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
            let data = response.json()
            .then(data => {
                if(!data.success){
                    alert(data.error);
                    console.log('Login failed:', data.error);
                } else {
                    alert(data.message);
                    console.log('Login successful:', data.message);
                }

            });    
        } else {
            alert('An error occurred during login. Please try again.');
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