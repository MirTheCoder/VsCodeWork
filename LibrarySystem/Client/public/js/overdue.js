let overdueList = document.getElementById('overdueBooksContainer'); //THis will get us the container where we will display all overdue boks along with the users for each overdue book
let numOverdue = document.getElementById('overdue-num'); //This will be where we put the total number of overdue books
let booksCheckedNum = document.getElementById('booksChecked-num'); //This is where te total number of books checked out will go
let borrowedNum = document.getElementById('borrowed-num'); //This is where te total number of books checked out will go


//We will use this function to first get all the users so that we can get all the overdue books that belong to them
document.addEventListener('DOMContentLoaded', async () => {
    try{
        let response = await fetch('/api/getAllOverdue', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let answer = await fetch('/api/numCheckedOut', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let solution = await fetch('/api/numBorrowers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });


        let data = await response.json();
        let result = await answer.json();
        let product = await solution.json();
        if(data.success && result.success && product.success){
            showOverdue(data.books, result.books, product.count);
        }
        
    } catch(err){
        console.error('Error fetching overdue books:', err);
    }
})

//Function that we will use to actually display the overdue books
async function showOverdue(list, booksChecked, borrowers){
    numOverdue.innerHTML = `${list.length}`
    booksCheckedNum.innerHTML = `${booksChecked.length}`
    borrowedNum.innerHTML = `${borrowers}`
    console.log("Number of borrowers is: ", borrowers)
    overdueList.innerHTML = ''
    if(list.length > 0){
        list.forEach(element => {
            let newDiv = document.createElement('div');
            newDiv.innerHTML = `

            <!-- This section right here will give the book iamge along with the book details as well -->
                <div class="overdueElement">
                <div class="overdueSect">
                <h4>Book</h4>
                <div class="overdueElement1">
                <img src="/api/getImage/${element.title}" alt="Book Image" class="overdueBookImage">
                <div class="bookDetails">
                    <h3>Title: ${element.title}</h3>
                    <p>Author: ${element.author}</p>
                    <p>ISBN: ${element.isbn}</p>
                </div>
                </div>
                </div>

                <!-- Information pertianing to the person who checked out the book-->    
                <div class="borrower">
                <h4>Borrower</h4>
                <h3>Name: ${element.username}</h3>
                <p>ID: ${element.userId}</p>
                <p>Email: ${element.email}</p>
                </div>

                <div class="checkedOut">
                    <h4>Checked Out</h4>
                    <h3>${timeFixer(element.dateChecked)} </h3>
                </div>

                 <div class="dueDate">
                    <h4>Due Date</h4>
                    <h3>${timeFixer(element.dueDate)}</h3>
                </div>

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

function timeFixer(date){
    const reviewDate = new Date(date);

    const formatted = reviewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
    }); 

    return formatted;
}