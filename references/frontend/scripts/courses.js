// courses.js
let arrBackBtns = document.querySelectorAll('.btnBack');

// Fill course info on load (Not implemented)

// Listeners

arrBackBtns.forEach(btnBack => {
    btnBack.addEventListener('click', () => {
        document.querySelector('#divNewCourse').style.display = 'none';
        document.querySelector('#divMainPage').style.display = 'block';
    });
});

document.querySelector('#btnNewCourse').addEventListener('click', () => {
    document.querySelector('#divMainPage').style.display = 'none';
    document.querySelector('#divNewCourse').style.display = 'block';
});