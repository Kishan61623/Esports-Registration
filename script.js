document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const pages = document.querySelectorAll('.page');
    const registrationForm = document.getElementById('registrationForm');

    const showPage = (id) => {
        pages.forEach(page => page.style.display = 'none');
        const targetPage = document.getElementById(id);
        if (targetPage) targetPage.style.display = 'block';
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            showPage(targetId);
        });
    });

    // Default Page Load
    showPage('tournament-info');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                teamName: document.getElementById('teamName').value.trim(),
                teamCaptain: document.getElementById('teamCaptain').value.trim(),
                mobileNumber: document.getElementById('mobileNumber').value.trim()
            };

            if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }

            try {
                const response = await fetch('https://esports-registration.onrender.com/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Registration failed');
                }

                // Show the Discord join page on success
                registrationForm.reset();
                showPage('success-page');

            } catch (error) {
                alert(error.message);
            }
        });
    }
});
