// ... existing server.js setup ...
app.post('/register', async (req, res) => {
    try {
        const newTeam = new Registration(req.body);
        await newTeam.save();
        res.status(200).json({ message: "Registration saved successfully!" });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const displayField = field === 'teamName' ? 'Team Name' : 'Mobile Number';
            return res.status(400).json({ error: `This ${displayField} is already registered.` });
        }
        res.status(500).json({ error: "Failed to save to database." });
    }
});
