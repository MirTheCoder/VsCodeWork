let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');
let accountLink = document.getElementById('account');
let addUserForm = document.getElementById('userForm');

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
                if(loginLink){
                    if(!loginLink.classList.contains('hide')){
                        loginLink.classList.add('hide')
                    }
                }
                if(accountLink){
                    if(accountLink.classList.contains('hide')){
                        accountLink.classList.remove('hide')
                    }
                }
                if(logoutLink){
                    if(logoutLink.classList.contains('hide')){
                        logoutLink.classList.remove('hide')
                    }    
                }
            } else {
                if(loginLink){
                    if(loginLink.classList.contains('hide')){
                        loginLink.classList.remove('hide')
                    }
                }
                if(accountLink){
                    if(!accountLink.classList.contains('hide')){
                        accountLink.classList.add('hide')
                    }
                }
                if(logoutLink){
                    if(!logoutLink.classList.contains('hide')){
                        logoutLink.classList.add('hide')
                    }
                }
                window.location.href = "indexPage"; //Send user back to home page if they are not logged in
            }
        });
    } catch (error) {
        console.error('Error checking login status:', error);
    }
});

//We will use this to get the user data and 
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let formData = new FormData(addUserForm);
    let userData = Object.fromEntries(formData.entries());
    console.log('User Data: ', userData); // Log the user data to the console for debugging
    try{
        let response = await fetch('/users/adminAddUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(userData)
                    })
        let data = await response.json();
        if(data.success){
            alert('User added successfully!');
            addUserForm.reset();
        } else {
            alert('Error adding user: ' + data.message);
        }
    } catch(error){
        console.error('Error adding user: ', error)
    }
})