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


 //This is the function that we will use to display all the users within the database   
async function showAllUsers(users){
    users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.innerHTML = `
                <h3>${user.username}</h3>
                <p>Email: ${user.email}</p>
                <p>Phone: ${user.number}</p>
            `;
            userList.appendChild(userElement);
        });
}