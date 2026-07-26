let addUserForm = document.getElementById('userForm');

//We will use this to get the user data and 
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let formData = new FormData(addUserForm);
    //Since we have radio buttons for the account status, we have to check and see which one is checked so that we can add its value to our form data
    addUserForm.querySelectorAll('#accountActive').forEach(input => { 
        if(input.checked){
            formData.set('accountStatus', input.value.trim());
        }
    })

    addUserForm.querySelectorAll('#accountRole').forEach(input => { 
        if(input.checked){
            formData.set('role', input.value.trim());
        }
    })

    let userData = Object.fromEntries(formData.entries());
    console.log('User Data: ', userData); // Log the user data to the console for debugging
    try{
        let response = await fetch('/users/adminAddUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(userData)
                    })
        let data = await response.json();
        if(data.success){
            alert('User added successfully!');
            addUserForm.reset();
        } else {
            alert('Error adding user: ' + data.message);
        }
    } catch(error){
        console.error('Error adding user: ', error)
    }
})