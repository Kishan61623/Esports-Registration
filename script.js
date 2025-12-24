document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const pages = document.querySelectorAll('.page');
    const registrationForm = document.getElementById('registrationForm');

    // Function to show a specific page
    const showPage = (id) => {
        pages.forEach(page => {
            page.style.display = 'none';
        });
        document.getElementById(id).style.display = 'block';
    };

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            showPage(targetId);
        });
    });

    // Initial page load
    showPage('home');

    // Handle "Register" button click on home page
    const homeRegisterButton = document.querySelector('#home button');
    if (homeRegisterButton) {
        homeRegisterButton.addEventListener('click', () => {
            showPage('registration');
        });
    }

    // Handle registration form submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const teamName = document.getElementById('teamName').value;
            const teamCaptain = document.getElementById('teamCaptain').value;
            const mobileNumber = document.getElementById('mobileNumber').value;

            // 1. Basic Validation
            if (teamName.trim() === '' || teamCaptain.trim() === '' || mobileNumber.trim() === '') {
                alert('Please fill in all fields.');
                return;
            }

            if (!/^[0-9]{10}$/.test(mobileNumber)) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }

            // 2. Prepare Data for MongoDB
            const formData = { 
                teamName: teamName, 
                teamCaptain: teamCaptain, 
                mobileNumber: mobileNumber 
            };

            // 3. Send data to your Node.js Server
            // Make sure your server.js is running and the URL matches!
            fetch('https://esports-registration.onrender.com/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                alert('Registration successful! Data saved to MongoDB.');
                
                // Reset form and go back to home
                registrationForm.reset();
                showPage('home');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Server error: Could not save registration. Make sure your backend server is running.');
            });
        });
    }

});

