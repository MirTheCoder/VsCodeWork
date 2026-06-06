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
                window.location.href = "indexPage"; //Send user back to home page if they are not logged in
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



//This will ensure tht we retrieve all users when the page loads
document.addEventListener('DOMContentLoaded', () => {
    //This will allow us to retrieve all the users within the database and display them
    //for the admin to view and see
    fetch('/users/allUsers')
        .then(response => response.json())
        .then(data => showAllUsers(data.users))
        .catch(error => {
            console.error('Error fetching users:', error);
        });
    });   
    
//We will use this function to get the catalog of books under each users name
async function getUsersBooks(username){
    try {
        const response = await fetch('/users/currentBooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        if (data.success && Array.isArray(data.books)) {
            return data.books;
        }
        return [];
    } catch (error) {
        console.error('Error fetching books for user', username, error);
        return [];
    }
}


 //This is the function that we will use to display all the users within the database   
async function showAllUsers(users){
    userList.innerHTML = ''; // Clear the user list before displaying new data
    users.forEach(user => {
            /*let books = getUsersBooks(user, username);
            const userElement = document.createElement('div');
            userElement.innerHTML = `
                <h2><b>User Details</b></h2>
                <h3>${user.userID}</h3>
                <h3>${user.username}</h3>
                <p>Email: ${user.email}</p>
                <p>Phone: ${user.number}</p>
                <p>Role: ${user.role}</p>
                <p>Account Status: ${user.accountStatus}</p>
                <p>Member Since: ${new Date(user.DateCreated).toLocaleDateString()}</p>
                `
                let usersBooks = document.createElement('div');
                usersBooks.innerHTML = ``
                if(books.length > 0){
                    books.forEach(book => {
                    usersBooks += `
                    <h3><b>Books Checked Out:</b></h3>
                    <p>Title: ${book.title}</p> 
                    <p>Author: ${book.author}</p>
                    <p>ISBN: ${book.isbn}</p>
                    <p>Due Date: ${book.dueDate.toLocaleDateString()}</p>`
                    });
                } else {
                    usersBooks += `<p>No books checked out</p>`
                }    
            userList.appendChild(userElement);
            userList.appendChild(usersBooks); */
            
            //We will use this to add each user instance to the see users page
            const userCardHTML = document.createElement('div');
            userCardHTML.innerHTML = `
        <div class="user-item">
            <div class="user-card-header">
                <div class="user-main-meta">
                    <span class="username">${user.username}</span>
                    <span class="userid">${user.userId}</span>
                </div>
                <span class="status-badge status-active">Active</span> 
                </div>
            
            <div class="user-details-grid">
                <div class="detail-group">
                    <span class="detail-label">$Email</span>
                    <span class="detail-value">${user.email}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${user.phone}</span>
                </div>
                <span class="user-role-badge">Admin</span>
                <div class="detail-group text-right">
                    <span class="detail-label">Created</span>
                    <span class="detail-value">${new Date(user.DateCreated).toLocaleDateString()}</span>
                </div>
            </div>

            <div class="user-actions">
                <button class="user-btn edit">Edit User</button>
                <button class="user-btn delete">Delete</button>
                <button class="user-btn" id="seeDetails" style="background-color: #686847; color: #FFF;">See Details</button>
            </div>
        </div>
        `;
            userList.appendChild(userCardHTML);
        })
        showUserDetails(); //We use this to add event listeners to each users page so that the admin can see more detils about the user if need be
    };

    //We will use this function to show the details of the user that the admin has chosen to view
    async function showUserDetails(){
        if(document.querySelectorAll('#seeDetails').length > 0){
            document.querySelectorAll('#seeDetails').forEach(button => {
                button.addEventListener('click', async (e) => {
                    let userDetails = e.target.closest('.user-item').querySelector('.userid').textContent; //Extracts the users ID from the user Card
                    console.log('Here is the users Details: ', userDetails); //We are gonna use this to test and see if we do get to see the users details
                    fillOverlay(userDetails); //We pass the user ID over to this function so that it can render an populate the overlay with the users details
                })
            })
        } else {
            console.log('No see details buttons found');
        }
    }

    async function fillOverlay(details){
        alert('User ID has been successfullt extracted and recieved: ', details);
        
    }
    
        