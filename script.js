async function loadCharts() {
    try {
        // 🔒 ใช้ Web App URL ล่าสุดที่คุณให้มา
        const apiUrl = 'https://script.google.com/macros/s/AKfycbwS2bfyaVqhFitr1JVCDJeONVNDK1F_mSnTqDaS30bAhzZPW8RSEa3KhauADMPzD2GS/exec'; 
        
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status === "success" && Array.isArray(result.data)) {
            const rawData = result.data;
            
            const barLabels = [];
            const barValues = [];

            rawData.forEach(item => {
                barLabels.push(item.label);
                barValues.push(parseFloat(item.value) || 0);
            });

            // 1. สร้างกราฟแท่ง (Bar Chart) ภาพรวมแบบไฮไลท์ตัวที่เลือก
            const canvasBar = document.getElementById('myChart');
            if (canvasBar) {
                const ctxBar = canvasBar.getContext('2d');
                if (window.barInstance instanceof Chart) window.barInstance.destroy();
                
                // ฟังก์ชันสำหรับสร้างสีแท่งกราฟ (ถ้าเป็นตัวที่ถูกเลือกให้สีเข้มโดดเด่น ตัวอื่นให้สีจางลง)
                function getBarColors(selectedIndex, length) {
                    let bgColors = [];
                    let borderColors = [];
                    for (let i = 0; i < length; i++) {
                        if (i === selectedIndex) {
                            // ตัวที่เลือก: สีเขียวเข้มเด่นชัด
                            bgColors.push('rgba(39, 174, 96, 0.95)');
                            borderColors.push('#1e8449');
                        } else {
                            // ตัวอื่นๆ รอบข้าง: สีเทาจางๆ โปร่งแสง
                            bgColors.push('rgba(189, 195, 199, 0.35)');
                            borderColors.push('#bdc3c7');
                        }
                    }
                    return { bg: bgColors, border: borderColors };
                }

                // เก็บ instance ของกราฟแท่งไว้เพื่อให้อัปเดตสีตาม Dropdown ได้
                window.updateBarChartHighlight = function(selectedIndex) {
                    const colors = getBarColors(selectedIndex, barValues.length);
                    window.barInstance.data.datasets[0].backgroundColor = colors.bg;
                    window.barInstance.data.datasets[0].borderColor = colors.border;
                    window.barInstance.data.datasets[0].borderWidth = window.barInstance.data.datasets[0].data.map((_, i) => i === selectedIndex ? 2 : 1);
                    window.barInstance.update();
                };

                window.barInstance = new Chart(ctxBar, {
                    type: 'bar',
                    data: {
                        labels: barLabels,
                        datasets: [{
                            label: 'คะแนนรวม Overall (%)',
                            data: barValues,
                            // ค่าเริ่มต้นกำหนดให้ไฮไลท์ตัวแรก (index 0) ก่อน
                            backgroundColor: getBarColors(0, barValues.length).bg,
                            borderColor: getBarColors(0, barValues.length).border,
                            borderWidth: 1.5,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return ` คะแนน Overall: ${context.raw.toFixed(2)}%`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { 
                                grid: { display: false }, 
                                offset: true,
                                ticks: { 
                                   display: false}
                                
                            },
                            y: { beginAtZero: true, max: 100 }
                        }
                    }
                });
            }

            // 2. ตั้งค่าระบบ Dropdown เลือกหน่วยงาน
            const selectElement = document.getElementById('unitSelect');
            selectElement.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index; 
                option.textContent = item.label; 
                selectElement.appendChild(option);
            });

            // ฟังก์ชันคำนวณ Rating Ranking ตามเกณฑ์ที่กำหนด
            function getRatingRank(score) {
                if (score >= 80) return { text: 'Best', color: '#27ae60' };
                if (score >= 60) return { text: 'Good', color: '#2980b9' };
                if (score >= 40) return { text: 'Moderate', color: '#f39c12' };
                if (score >= 20) return { text: 'Limited', color: '#d35400' };
                return { text: 'Unacceptable', color: '#c0392b' };
            }

            // ฟังก์ชันอัปเดตกราฟโดนัท ตาราง และเรตติ้ง
            function updateDashboard(index) {
                const selectedData = rawData[index];
                const details = selectedData.details || [];
                
                
                // ดึงค่า 7 หมวดแรก (index 0 ถึง 6) มาทำกราฟโดนัทและตาราง
                const pieScores = details.slice(0, 7).map(val => (val === "" || val === "-") ? 0 : Number(val));
                
                // คะแนน Overall (สมมติอยู่ตำแหน่ง index 7 หรือใช้ค่า value หลัก)
                const overallScore = parseFloat(selectedData.value) || 0;
                const rating = getRatingRank(overallScore);

                // อัปเดตหัวข้อและผลการประเมิน
                document.getElementById('pieTitle').textContent = `สัดส่วนคะแนนแต่ละหมวดของ: ${selectedData.label}`;
                document.getElementById('overallScoreText').textContent = overallScore.toFixed(2) + '%';
                
                const badge = document.getElementById('ratingBadge');
                badge.textContent = rating.text;
                badge.style.backgroundColor = rating.color;

                // อัปเดตตัวเลขลงในตารางทั้ง 7 หมวด (หากช่องไหนเป็น 0 หรือค่าว่าง ให้แสดงเป็น "-")
                for (let i = 1; i <= 7; i++) {
                    let scoreVal = details[i - 1];
                    let displayVal = (scoreVal === 0 || scoreVal === "" || scoreVal === "-") ? "-" : Number(scoreVal).toFixed(2);
                    document.getElementById(`score${i}`).textContent = displayVal;
                }

                // สร้าง/อัปเดตกราฟ Doughnut (7 หมวด)
                const canvasPie = document.getElementById('pieChart');
                if (canvasPie) {
                    const ctxPie = canvasPie.getContext('2d');
                    if (window.pieInstance instanceof Chart) {
                        window.pieInstance.destroy();
                    }

                    window.pieInstance = new Chart(ctxPie, {
                        type: 'doughnut',
                        data: {
                            labels: [
                                'หมวดที่ 1 คะแนนองค์กร', 
                                'หมวดที่ 2 วัตถุดิบ', 
                                'หมวดที่ 3 พลังงาน', 
                                'หมวดที่ 4 น้ำ', 
                                'หมวดที่ 5 กากของเสีย',
                                'หมวดที่ 6 อาคาร',
                                'หมวดที่ 7 ก๊าซเรือนกระจก'
                            ],
                            datasets: [{
                                data: pieScores,
                                backgroundColor: [
                                    '#27ae60', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6', '#e67e22', '#1abc9c'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { 
                                    position: 'bottom',
                                    labels: { font: { family: 'Prompt', size: 11 } }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            let labelName = context.label || '';
                                            let value = context.raw || 0;
                                            return ` ${labelName}: ${value === 0 ? '-' : value.toFixed(2)} คะแนน`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
                if (window.updateBarChartHighlight) {
                    window.updateBarChartHighlight(Number(index));
                }
                // ในฟังก์ชัน updateDashboard(index) ให้เพิ่ม:
                window.barInstance.options.plugins.title = {
                    display: true,
                    text: `หน่วยงานที่เลือก: ${selectedData.label}`, // จะโชว์ชื่อบนหัวกราฟแท่ง
                    font: { size: 16, family: 'Prompt' }
                };
                window.barInstance.update();

            }

            // โหลดข้อมูลแถวแรกเริ่มต้น
            updateDashboard(0);

            // ดักจับเหตุการณ์เปลี่ยน Dropdown
            selectElement.addEventListener('change', function() {
                updateDashboard(this.value);
            });

        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดกราฟ:', error);
    }
}

loadCharts();