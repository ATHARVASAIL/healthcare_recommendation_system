// script.js
document.getElementById('symptomForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const symptoms = document.getElementById('symptoms').value;
    
    // Make a POST request with the symptoms
    const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: symptoms })
    });

    if (response.ok) {
        const data = await response.json();
        displayResults(data);
    } else {
        console.error('Error:', response.statusText);
    }
});

function displayResults(data) {
    const resultTable = document.getElementById('resultTable');
    const resultBody = document.getElementById('resultBody');

    // Clear previous results
    resultBody.innerHTML = '';

    // Create a new row for the data
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${data.Disease}</td>
        <td>${data.Medicines}</td>
        <td>${data.Precautions}</td>
        <td>${data.Workout}</td>
        <td>${data.Diet}</td>
    `;
    resultBody.appendChild(row);
    
    // Show the table after adding data
    resultTable.style.display = 'table';
}
