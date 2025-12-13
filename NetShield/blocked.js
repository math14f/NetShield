// Filnavn: blocked.js
document.addEventListener('DOMContentLoaded', function() {
    // Find knappen
    const backButton = document.getElementById('go-back-btn');
    
    // Lyt efter klik
    if (backButton) {
        backButton.addEventListener('click', function() {
            // I stedet for history.back(), sender vi dem til en sikker side
            window.location.href = "https://www.google.com";
        });
    }
});
