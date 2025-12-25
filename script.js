document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const pages = document.querySelectorAll('.page');
    const registrationForm = document.getElementById('registrationForm');

    // Function to show a specific page
    const showPage = (id) => {
        pages.forEach(page => {
            page.style.display = 'none';
        });
        const targetPage = document.getElementById(id);
        if (targetPage) targetPage.style.display = 'block';
    };

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            showPage(targetId);
        });
    });

    // Initial page load logic
    showPage('tournament-info'); // Changed to match the actual ID of the home section

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
            fetch('https://esports-registration.onrender.com/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(async response => {
                // Read the JSON data even if the status is not 200
                const data = await response.json();

                if (!response.ok) {
                    // Throw the specific error message from the backend
                    throw new Error(data.error || 'Registration failed');
                }
                return data;
            })
            .then(data => {
                console.log('Success:', data);
                alert(data.message || 'Registration successful!');
                
                // Reset form and go back to home
                registrationForm.reset();
                showPage('home');
            })
            .catch((error) => {
                console.error('Error:', error);
                // Displays the specific reason for failure (e.g., duplicate team name)
                alert(error.message);
            });
        });
    }
});
