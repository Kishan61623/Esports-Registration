document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const pages = document.querySelectorAll('.page');
    const registrationForm = document.getElementById('registrationForm');

    const showPage = (id) => {
        pages.forEach(page => page.style.display = 'none');
        document.getElementById(id).style.display = 'block';
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(e.target.getAttribute('href').substring(1));
        });
    });

    showPage('home');

    const homeRegisterButton = document.querySelector('#home button');
    if (homeRegisterButton) {
        homeRegisterButton.addEventListener('click', () => showPage('registration'));
    }

    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = { 
                teamName: document.getElementById('teamName').value.trim(), 
                teamCaptain: document.getElementById('teamCaptain').value.trim(), 
                mobileNumber: document.getElementById('mobileNumber').value.trim() 
            };

            // Basic Validation
            if (!formData.teamName || !formData.teamCaptain || !formData.mobileNumber) {
                alert('Please fill in all fields.');
                return;
            }

            // Send data to Render
            fetch('https://esports-registration.onrender.com/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            .then(async (response) => {
                // We read the JSON body even if the response is NOT 'ok'
                const data = await response.json();
                
                if (!response.ok) {
                    // If server sends a 400 error, we 'throw' the specific error message
                    throw new Error(data.error || 'Registration failed');
                }
                return data;
            })
            .then(data => {
                alert(data.message); // "Registration successful!"
                registrationForm.reset();
                showPage('home');
            })
            .catch((error) => {
                // This now catches the "The Team Name ... is already registered" message
                alert(error.message); 
            });
        });
    }
});
