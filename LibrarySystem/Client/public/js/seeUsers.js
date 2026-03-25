let userList = document.getElementById('userList');


//This will ensure tht we retrieve all users when the page loads
document.addEventListener('DOMContentLoaded', () => {
    //This will allow us to retrieve all the users within the database and display them
    //for the admin to view and see
    fetch('/users/allUsers')
        .then(response => response.json())
        .then(users => showAllUsers(users))
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
    users.forEach(user => {
            let books = getUsersBooks(user,username);
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
            userList.appendChild(usersBooks);
        })
    };