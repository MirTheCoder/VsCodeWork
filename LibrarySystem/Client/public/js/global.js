//This file will be used to manipulate the navigation bar

let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');
let accountLink = document.getElementById('account');

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
                //Send them back to index page only if they aren't on the index page to begin with
                if(window.location.pathname != "/indexPage"){
                    window.location.href = "indexPage"; //Send user back to home page if they are not logged in
                }
            }
        });
    } catch (error) {
        console.error('Error checking login status:', error);
    }
});

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
              