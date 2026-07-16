let userList = document.getElementById('userList');
let logoutLink = document.getElementById('logout');
let loginLink = document.getElementById('login');
let accountLink = document.getElementById('Account');
let overlay = document.getElementById('overlay');
let overlayDetails = document.getElementById('userDetails');
let closePopup = document.getElementById('closePopup');
let editOverlay = document.getElementById('editUserOverlay');



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
        overlayDetails.innerHTML = ''; //Clear the overlay of any previous data that may be there from a previous user that the admin may have viewed
         if(overlay && overlay.classList.contains('active')){ //This is to check if the overlay is already active and visible on the page
            overlay.classList.remove('active'); //This will make the overlay invisible on the page
        }
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

//We will use this function to handle and deletions of accounts made by the admin
async function deleteAUser(){
    if(document.querySelectorAll(".delete")){
        let deleteButtons = document.querySelectorAll(".delete")
        deleteButtons.forEach(button => {
            button.addEventListener('click', async(e) => {
                let userId = e.target.closest('.user-item').querySelector('.userid').textContent //Gets the userId of the users account that we want to delete
                alert("Here is our users ID: ", userId)
                let response =await fetch("users/deleteUser", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId: userId})

                })
                .then(response => response.json())
                .then(data => {
                    if(data.success){
                        alert(`${data.message}`);
                        window.location.href = "seeUsers"; //Reload the page to reflect the changes made
                    } else {
                        alert(`${data.message}`);
                    }   
            })

            })
        })
    }
}

//This function will allow admin to edit the info on useers accounts
async function editAUser(){
    //Want to first make sure that there are edit buttons on the page before we try to add event listeners to them
     if(document.querySelectorAll(".edit")){
        let editButtons = document.querySelectorAll(".edit")
        editButtons.forEach(button => {
            button.addEventListener('click', async(e) => {
                let userId = e.target.closest('.user-item').querySelector('.userid').textContent //Gets the userId of the users account that we want to edit
                //We will use this to first get the users details that we can show to the admin before they edit the user details
                await fetch("users/getUser", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId: userId})
            })
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    renderEditOverlay(data.user); //This function will display tehe actual user data form that the admin can edit
                } else {
                    alert(`${data.message}`);
                }
            })    

            })
        })
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
                ${user.accountStatus.toLowerCase() == "active" ? `<span class="status-badge status-active">${user.accountStatus}</span>` : `<span class="status-badge status-suspended">${user.accountStatus}</span>`}
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
        deleteAUser(); //This will place event listeners on the delete buttons
        editAUser(); //This will place event listeners on the edit buttons
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
        let user = await accountStatus(details); //We will store the users account in here
        let userDetails = document.createElement('div');
        let userBooks = document.createElement('div');
        let overdueBooks = document.createElement('div');
        let dueSoonBooks = document.createElement('div');
        let userFines = document.createElement('div');
        userDetails.innerHTML = `
        <h3>${user.username}</h3>
        <p>Email: ${user.email}</p>
        <p>Member Since: ${new Date(user.DateCreated).toLocaleDateString()}</p>
        `; //This will be used to contain the user details in our overlay block


        //We will traverse through various scenarios to see how we want to display our data and what data we have to display in the first place.
        if(user.success === 1){
            //This means that we only have the users details and no books to show
            userBooks.innerHTML = `
            <h3><b>Books Checked Out<b></h3>
            <p>No books checked out</p>`;
            dueSoonBooks.innerHTML = `
            <h3><b>Books Due Soon:</b></h3>
            <p>No books due soon</p>`;
            overdueBooks.innerHTML = `
            <h3><b>Overdue Books<b></h3>
            <p>No overdue books</p>`;
            userFines.innerHTML = `
                <h3><b>Fines</b></h3>
                <p>No Fines</p>
            `
        } else if(user.success === 2){
            overdueBooks.innerHTML = `
            <h3><b>Overdue Books</b></h3>
            <p>No overdue books</p>`;
            userFines.innerHTML = `
                <h3><b>Fines</b></h3>
                <p>No Fines</p>
            `
            userBooks.innerHTML = `<h3><b>Books Checked Out</b></h3>`;
            for(let book of user.yourBooks){
                userBooks.innerHTML += `
                <div class="book-item">
                <p>Title: ${book.title}</p> 
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Due Date: ${new Date(book.dueDate).toLocaleDateString()}</p>
                </div>`;
            }

            if(user.dueSoonBooks.length !== 0){
                dueSoonBooks.innerHTML = `<h3><b>Books Due Soon</b></h3>`; //We want to make sure to add the header for this section before we populate it with the books that are due soon
            for(let book of user.dueSoonBooks){
                dueSoonBooks.innerHTML += `
                <div class="book-item">
                <p>Title: ${book.title}</p> 
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Due Date: ${new Date(book.dueDate).toLocaleDateString()}</p>
                </div>`;
            }
            } else {
                dueSoonBooks.innerHTML = `
            <h3><b>Books Due Soon</b></h3>
            <p>No books due soon</p>`;
            }
        } else if(user.success === 3){
            userBooks.innerHTML = `<h3>Books Checked Out</h3>`;
            for(let book of user.yourBooks){
                userBooks.innerHTML += `
                <div class="book-item">
                <p>Title: ${book.title}</p> 
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Due Date: ${new Date(book.dueDate).toLocaleDateString()}</p>
                </div>`;
            }

             if(user.dueSoonBooks.length !== 0){
                dueSoonBooks.innerHTML = `<h3><b>Books Due Soon</b></h3>`; //We want to make sure to add the header for this section before we populate it with the books that are due soon
            for(let book of user.dueSoonBooks){
                dueSoonBooks.innerHTML += `
                <div class="book-item">
                <p>Title: ${book.title}</p> 
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Due Date: ${new Date(book.dueDate).toLocaleDateString()}</p>
                </div>`;
            }
            } else {
                dueSoonBooks.innerHTML = `
            <h3><b>Books Due Soon</b></h3>
            <p>No books due soon</p>`;
            }

            overdueBooks.innerHTML = `<h3><b>Overdue Books</b></h3>`;
            for(let book of user.yourOverdueBooks){
                overdueBooks.innerHTML += `
                <div class="book-item">
                <p>Title: ${book.title}</p> 
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Due Date: ${new Date(book.dueDate).toLocaleDateString()}</p>
                </div>`;
            }

            userFines.innerHTML = `
            <h3><b>Fines</b></h3>
            <p>No Fines</p>
            `
        } else if(user.success === 4){
            userBooks.innerHTML = `<h3><b>Books Checked Out</b></h3>`;
            for(let book of user.yourBooks){
                userBooks.innerHTML += `
                <div class="book-item">
                <p>Title: ${book.title}</p> 
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Due Date: ${new Date(book.dueDate).toLocaleDateString()}</p>
                </div>`;
            }

             if(user.dueSoonBooks.length !== 0){
                dueSoonBooks.innerHTML = `<h3><b>Books Due Soon</b></h3>`; //We want to make sure to add the header for this section before we populate it with the books that are due soon
            for(let book of user.dueSoonBooks){
                dueSoonBooks.innerHTML += `
                <div class="book-item">
                <p>Title: ${book.title}</p> 
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Due Date: ${new Date(book.dueDate).toLocaleDateString()}</p>
                </div>`;
            }
            } else {
                dueSoonBooks.innerHTML = `
            <h3><b>Books Due Soon</b></h3>
            <p>No books due soon</p>`;
            }

            overdueBooks.innerHTML = `<h3><b>Overdue Books</b></h3>`;
             for(let book of user.yourOverdueBooks){
                overdueBooks.innerHTML += `
                <div class="book-item">
                <p>Title: ${book.title}</p> 
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Due Date: ${new Date(book.dueDate).toLocaleDateString()}</p>
                </div>`;
            }

            userFines.innerHTML = `<h3><b>Fines</b></h3>`;
            for(let fine of user.yourFines){
                userFines.innerHTML += `
                <div class="book-item">
                <p>Title: ${fine.bookTitle}</p> 
                <p>Author: ${fine.bookAuthor}</p>
                <p>ISBN: ${fine.isbn}</p>
                <p>Amount: $${fine.amount}</p> 
                <p>Date Issued: ${new Date(fine.fineDate).toLocaleDateString()}</p>
                </div>`;
            }
        }

        //We are now gonna add all the sections to our overlay block so that the admin can see all of the relevant details for the user that they are interested in
        overlayDetails.appendChild(userDetails);
        overlayDetails.appendChild(userBooks);
        overlayDetails.appendChild(dueSoonBooks);
        overlayDetails.appendChild(overdueBooks);
        overlayDetails.appendChild(userFines);

        //Want to add the active class only if the overlay does not already have it
        if(overlay && !overlay.classList.contains('active')){ //This is to check if the overlay is already active and visible on the page
            overlay.classList.add('active'); //This will make the overlay visible on the page
        }

        //This will first check and see if the close popup button has rendered, and if so, we will add an event
        //listener that will close the popup and clear the data from the popup overlay
        if(closePopup){
            closePopup.addEventListener('click', () => {
                if(overlay && overlay.classList.contains('active')){ //This is to check if the overlay is already active and visible on the page
                    overlay.classList.remove('active'); //This will make the overlay invisible on the page
                }
                overlayDetails.innerHTML = ''; //Clear the overlay of any previous data that may be there from a previous user that the admin may have viewed
            })
        }
    }
    

async function accountStatus(details){
    try {
        const response = await fetch('users/details', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId: details})
        });
        const data = await response.json();
        let userItems = {};
        if(data.success === 1){
            userItems = {
                username: data.user,
                email: data.email,
                DateCreated: new Date(data.memberSince).toLocaleDateString(),
                success: 1
            };
        } else if(data.success === 2){
            userItems = {
                username: data.user,
                email: data.email,
                DateCreated: new Date(data.memberSince).toLocaleDateString(),
                yourBooks: data.yourBooks,
                dueSoonBooks: data.dueSoonBooks,
                success: 2
            };
        } else if(data.success === 3){
            userItems = {
                username: data.user,
                email: data.email,
                DateCreated: new Date(data.memberSince).toLocaleDateString(),
                yourBooks: data.yourBooks,
                dueSoonBooks: data.dueSoonBooks,
                yourOverdueBooks: data.yourOverdueBooks,
                success: 3
            };
        } else if(data.success === 4){
            userItems = {
                username: data.user,
                email: data.email,
                DateCreated: new Date(data.memberSince).toLocaleDateString(),
                yourBooks: data.yourBooks,
                dueSoonBooks: data.dueSoonBooks,
                yourOverdueBooks: data.yourOverdueBooks,
                yourFines: data.yourFines,
                success: 4
            };
        }
        return userItems;
    } catch (err) {
        console.error('Error in accountStatus:', err);
        return {};
    }
}    


async function renderEditOverlay(user){
    //First we will display the actualy edit overlay form for the admin to see and edit
    if(!editOverlay.classList.contains('active')){
        editOverlay.classList.add('active');
    }

    //This will allow us to add logic tot he close button so that the pop up will close if the admin has changed their mind about changng user info
    const closeEditPopup = document.getElementById('closeEditPopup')
    const editUserForm = document.getElementById('editUserForm')
    if(closeEditPopup){
        closeEditPopup.addEventListener('click', closeEditOverlay)
    }    
    //We will use this to populate the overlay with the users information (using the users info essentially as placeholders)
    let username = editOverlay.querySelector('#username')
    username.value = user.username;
    let email = editOverlay.querySelector('#email')
    email.value = user.email;
    let phone = editOverlay.querySelector('#phone')
    phone.value = user.phone;

    //These are our radio buttons, to ensure that admins only choose from amongst the two available options
    let role = editOverlay.querySelector(`input[name="accountRole"][value="${user.role}"]`)
    if(role){
        role.checked = true;
    }
    let accountActive = editOverlay.querySelector(`input[name="accountActive"][value="${user.accountStatus}"]`)
    //Here we will check the box or radio button according to whether or not the user has an active accoutn status or not
    if(accountActive){
        accountActive.checked = true;
    }
    if(editUserForm){
        editUserForm.addEventListener('submit', (e) => submitEdits(e, user))
    }

}    

async function closeEditOverlay(){
    if(editOverlay.classList.contains('active')){
        editOverlay.classList.remove('active');
    }
    closeEditPopup.removeEventListener('click', closeEditOverlay) //We want to make sure that we do not add multiple event listeners to the close button
    editUserForm.removeEventListener('submit', (e) => submitEdits(e)) //We want to make sure that we do not add multiple event listeners to the form submit button
}

async function submitEdits(e, user){
     e.preventDefault();
     //Getting the data from the form and passing it to our backend
     formData = new FormData(editUserForm);
            const updatedUser = {
                userId: user.userId,
                username: formData.get('username'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                role: editOverlay.querySelector('input[name="accountRole"]:checked').value,
                accountStatus: editOverlay.querySelector('input[name="accountActive"]:checked').value
            };
            try{
                const response = await fetch('users/editUser', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(updatedUser)
                });
                const data = await response.json();
                if(data.success){
                    alert('User info updated successfully')
                    window.location.reload(); //Reload the page once the users info has been succesfully edited
                } else {
                    alert('Unable to update user info at this time, please try again later')
                }
            } catch(error){
                console.log("Error updating user: ", error);
                alert("Error while updating user info, please try again later")
            }
}