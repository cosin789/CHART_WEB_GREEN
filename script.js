async function loadChartData() {
    try {
        // 🔒 ใช้ Web App URL ที่ลงท้ายด้วย /exec ของคุณ
        const apiUrl = 'https://script.google.com/macros/s/AKfycbzBv0lrEBrCue3bH-KH9QraTco99TS5zNjX8NxD-a1E5Q1R3PlqvMFlcyokl6lzRdrP/exec'; 
        
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status === "success" && Array.isArray(result.data)) {
            const rawData = result.data;
            
            const labels = [];
            const values = [];

            // วนลูปหยิบ label (Column C) และ value (Column K) มาใส่กราฟโดยตรง
            rawData.forEach(item => {
                labels.push(item.label);
                // แปลงค่า value เป็นตัวเลข (ถ้าช่องไหนว่างหรือพัง ให้เป็น 0)
                values.push(parseFloat(item.value) || 0); 
            });

            const canvasElement = document.getElementById('myChart');
            if (!canvasElement) return;

            const ctx = canvasElement.getContext('2d');
            
            // ล้างกราฟเก่าทิ้งก่อนวาดใหม่ (ป้องกันกราฟซ้อนทับกัน)
            if (window.myChartInstance instanceof Chart) {
                window.myChartInstance.destroy();
            }

            // สร้างกราฟแท่ง (Bar Chart)
            window.myChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'ข้อมูลสรุปประจำปี 2025',
                        data: values,
                        backgroundColor: 'rgba(39, 174, 96, 0.75)',
                        borderColor: '#27ae60',
                        borderWidth: 1.5,
                        borderRadius: 6,
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
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { 
                                font: { family: 'Prompt', size: 12 },
                                color: '#7f8c8d',
                                autoSkip: false,
                                maxRotation: 45,
                                minRotation: 0
                            },
                            offset: true
                        },
                        y: {
                            grid: { color: '#edf2f7' },
                            ticks: { font: { family: 'Prompt', size: 12 }, color: '#7f8c8d' },
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผ่าน API:', error);
    }
}

// เรียกใช้งานฟังก์ชัน
loadChartData();