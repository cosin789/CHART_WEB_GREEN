// ลิงก์ CSV ของคุณ
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnf4qJl5c9iAdJhTdatJ1gbuoRvJfQt7oYN9QglFBkveQegTKRpPQmC5QyRvNZMQ/pub?output=csv';

Papa.parse(sheetUrl, {
    download: true,
    header: true, // กำหนดให้แถวแรกเป็นชื่อคอลัมน์
    complete: function(results) {
        const data = results.data;
        
        // --- ส่วนที่ต้องแก้ไขให้ตรงกับชื่อหัวคอลัมน์ในไฟล์ของคุณ ---
        // เปลี่ยน 'Month' และ 'Sales' ให้เป็นชื่อคอลัมน์จริงๆ ใน Sheet ของคุณ
        const labels = data.map(row => row['Temperature']); 
        const values = data.map(row => parseFloat(row['Humidity']));
        // ----------------------------------------------------

        renderChart(labels, values);
    }
});

function renderChart(labels, data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar', // เปลี่ยนเป็น 'line' หากต้องการกราฟเส้น
        data: {
            labels: labels,
            datasets: [{
                label: 'ข้อมูลจาก Google Sheets',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}