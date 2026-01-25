document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const pages = document.querySelectorAll('.page');
    const registrationForm = document.getElementById('registrationForm');
    const statusMsg = document.getElementById('statusMessage');

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

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            statusMsg.style.display = 'none'; // Clear old messages

            const formData = {
                teamName: document.getElementById('teamName').value.trim(),
                teamCaptain: document.getElementById('teamCaptain').value.trim(),
                mobileNumber: document.getElementById('mobileNumber').value.trim()
            };

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

                // Show Success in HTML
                statusMsg.textContent = "✅ Database Saved Successfully!";
                statusMsg.className = "status-success";

                setTimeout(() => {
                    registrationForm.reset();
                    statusMsg.style.display = 'none';
                    showPage('success-page');
                }, 2000);

            } catch (error) {
                // Show Error in HTML
                statusMsg.textContent = "❌ " + error.message;
                statusMsg.className = "status-error";
            }
        });
    }
});
