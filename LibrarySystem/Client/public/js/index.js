let welcome1 = document.getElementById('w1');
let welcome2 = document.getElementById('w2');
let welcome3 = document.getElementById('w3');

// Adding event listeners to trigger respective acts when clicked
welcome1.addEventListener('click', () => {
    alert("You choose to click to choose from a variety of books!");
});

welcome2.addEventListener('click', () => {
    alert("You choose to click to see Reviews on your favorite books!");
});

welcome3.addEventListener('click', () => {
    alert("You choose to click to donate a book (pdf only)!");
});    