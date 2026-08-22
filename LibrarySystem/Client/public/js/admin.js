let a1 = document.getElementById('a1')
let a2 = document.getElementById('a2')
let a3 = document.getElementById('a3')
let a4 = document.getElementById('a4')
let userList = document.getElementById('userList');


//We want to first cheeck if the user has the right access authority to see the admin page before we let them in
document.addEventListener('DOMContentLoaded', async () => {
    try{
        let response = await fetch('users/checkRole', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let data = await response.json();
        if(data.role === "admin"){
            console.log("User is an admin")
        } else {
            alert("You do not have the right access authority to view this page. You will be redirected to the home page") //Give the user feedback as to why they can not access this page
            window.location.href = "IndexPage" //If the user is not an admin, then we will send them to the account page
        }
    } catch(err){
        console.log("error checking user role: ", err)
    }
})



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

a3.addEventListener('click', () => {
    window.location.href = 'overdue.html'
});




