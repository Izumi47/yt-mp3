document.getElementById('convertForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const youtubeUrl = document.getElementById('youtubeUrl').value;
    const resultDiv = document.getElementById('result');

    try {
        const response = await fetch('/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: youtubeUrl }),
        });

        const data = await response.json();
        if (response.ok) {
            resultDiv.innerHTML = `<a href="${data.downloadUrl}">Download MP3</a>`;
        } else {
            resultDiv.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        resultDiv.textContent = `Error: ${error.message}`;
    }
});
