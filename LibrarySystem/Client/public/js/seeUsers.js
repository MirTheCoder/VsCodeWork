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
async function getUsersBooks(user){
    fetch('/users/currentBooks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: user})
    })
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
                <h3><b>Books Checked Out:</b></h3>
                <ul>
                    ${books.map(book => `<li>${book.title} by ${book.author} (Due: ${new Date(book.dueDate).toLocaleDateString()})</li>`).join('')}
                </ul>
            `;
            userList.appendChild(userElement);
        });
}