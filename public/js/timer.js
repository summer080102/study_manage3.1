document.addEventListener('DOMContentLoaded', () => {
    const totalStudyTimeElement = document.getElementById('total-study-time-container');

    async function updateTotalStudyTime() {
        try {
            const response = await fetch('/timer/total-study-time');
            const data = await response.json();

            if (data.success) {
                const totalMinutes = data.totalStudyTime;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;

                totalStudyTimeElement.innerHTML = `
                    <h2>Total Study Time</h2>
                    <p><strong>${hours} hours ${minutes} minutes</strong></p>
                `;
            } else {
                console.error('Failed to update total study time:', data.message);
            }
        } catch (error) {
            console.error('Error fetching total study time:', error);
        }
    }

    // Update total study time on page load
    updateTotalStudyTime();
});