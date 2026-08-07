let overdueList = document.getElementById('overdueBooksContainer'); //THis will get us the container where we will display all overdue boks along with the users for each overdue book


//We will use this function to first get all the users so that we can get all the overdue books that belong to them
document.addEventListener('DOMContentLoaded', async () => {
    try{
        let response = await fetch('/api/getAllOverdue', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let data = await response.json();
        if(data.success){
            showOverdue(data.books);
        }
        
    } catch(err){
        console.error('Error fetching overdue books:', err);
    }
})

//Function that we will use to actually display the overdue books
async function showOverdue(list){
    overdueList.innerHTML = ''
    if(list.length > 0){
        list.forEach(element => {
            let newDiv = document.createElement('div');
            newDiv.innerHTML = `
                <div class="bookDetails">
                    <h3>Title: ${element.title}</h3>
                    <p>Author: ${element.author}</p>
                </div>
            `
            newDiv.classList.add('overdueBook');
            overdueList.appendChild(newDiv);
        });
    } else {
        //Revert back to the default rendering if no overdue books are found
        overdueList.innerHTML = `<p style="text-align: center" id="overdueBooksHolder">There are currently no overdue books</p>`
    }
}