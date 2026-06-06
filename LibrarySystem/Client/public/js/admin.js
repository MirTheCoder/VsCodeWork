let a1 = document.getElementById('a1')
let a2 = document.getElementById('a2')
let a3 = document.getElementById('a3')
let a4 = document.getElementById('a4')



//We will send the admin to the manage books page when they click the manage books link
a2.addEventListener('click', () => {
    window.location.href = 'ManageBooks.html'
});    

//Brings us to a page where we can see all the users within our database
a1.addEventListener('click', () => {
    window.location.href = 'seeUsers.html'
});

a4.addEventListener('click', () => {
    window.location.href = 'addUser.html'
})

let userList = document.getElementById('userList');
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

//This is needed to avoid errors if the logout link is not present on the page
if(logoutLink) {
//This function will handle the logout process if the logout link is clicked    
    logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
                await fetch('users/logout', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(async response => {
                    if(response.status === 400){
                        alert('You are not logged in!');
                    } else {
                        return await response.json();
                    }
                })
                .then(data => {
                    if(data.success){
                        alert(`${data.message}`);
                        window.location.href = "indexPage";
                    } else {
                        alert(`${data.message}`);
                    }
                });
    });  
}