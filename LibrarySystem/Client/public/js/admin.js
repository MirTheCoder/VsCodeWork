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