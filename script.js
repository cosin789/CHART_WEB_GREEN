async function loadChartData() {
    try {
        // ลิงก์ CSV จาก Google Sheets ของคุณ
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnf4qJl5c9iAdJhTdatJ1gbuoRvJfQt7oYN9QglFBkveQegTKRpPQmC5QyRvNZMQ/pub?output=csv';
        
        const response = await fetch(csvUrl);
        const csvText = await response.text();

        // แปลงข้อความ CSV เป็นแถว (Rows)
        const rows = csvText.trim().split('\n').map(row => row.split(','));
        
        const labels = [];
        const values = [];

        // วนลูปอ่านข้อมูลเริ่มจากแถวที่ 2 (ข้าม Header แถวแรก)
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i];
            if (cols.length >= 2) {
                labels.push(cols[0].trim()); // คอลัมน์ที่ 1: วันที่ / เวลา (Labels)
                values.push(parseFloat(cols[1].trim())); // คอลัมน์ที่ 2: ค่าตัวเลข (Data)
            }
        }

        // สร้างกราฟแท่งลงบน Canvas
        const ctx = document.getElementById('myChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar', // เปลี่ยนประเภทกราฟเป็น Bar Chart
            data: {
                labels: labels,
                datasets: [{
                    label: 'ข้อมูล Time Series (กราฟแท่ง)',
                    data: values,
                    backgroundColor: 'rgba(39, 174, 96, 0.75)', // สีเขียวโปร่งแสงสวยงาม
                    borderColor: '#27ae60', // ขอบแท่งกราฟ
                    borderWidth: 1.5,
                    borderRadius: 6, // ทำมุมขอบบนของแท่งกราฟให้โค้งมนดูพรีเมียม
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { family: 'Prompt', size: 13 },
                            color: '#2c3e50'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        titleFont: { family: 'Prompt', size: 14 },
                        bodyFont: { family: 'Prompt', size: 13 },
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { display: false }, // ปิดเส้นตารางแนวตั้งเพื่อให้ดูสะอาด
                        ticks: { font: { family: 'Prompt', size: 12 }, color: '#7f8c8d' }
                    },
                    y: {
                        grid: { color: '#edf2f7' }, // เส้นตารางแนวนอนแบบบางๆ
                        ticks: { font: { family: 'Prompt', size: 12 }, color: '#7f8c8d' }
                    }
                }
            }
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล CSV:', error);
    }
}

// เรียกใช้งานฟังก์ชันโหลดข้อมูลทันทีที่เปิดเว็บ
loadChartData();