const urlParams = new URLSearchParams(window.location.search);
const myToken = urlParams.get('token');

// ฟังก์ชันหลักที่รับค่าปี (ค่าเริ่มต้นเป็น 2025)
async function loadCharts(selectedYear = "2025") {
    try {
        if (!myToken) {
            alert("กรุณาระบุ Token ใน URL เช่น ?token=OPNA123");
            return;
        }
        // ใช้ URL พร้อมพารามิเตอร์ปี
        const baseUrl = 'https://script.google.com/macros/s/AKfycby9s_Ei3U0yTFAB_YX3F0M4RwJ3yfgrndje7a9fsTzMesWij5TRzH05JG5HyBIm-Eqe/exec'; 
        const apiUrl = `${baseUrl}?year=${selectedYear}&token=${myToken}`;

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status === "success" && Array.isArray(result.data)) {
            const rawData = result.data;
            if(rawData.length === 0) { console.log("ไม่พบข้อมูล"); return; }
            const barLabels = rawData.map(item => item.label);
            const barValues = rawData.map(item => parseFloat(item.value) || 0);

            // 1. สร้างกราฟแท่ง (Bar Chart)
            // const canvasBar = document.getElementById('myChart');
            // const ctxBar = canvasBar.getContext('2d');
            
            // // เคลียร์กราฟเก่าถ้ามีการเปลี่ยนปี
            // if (window.barInstance instanceof Chart) window.barInstance.destroy();

            // function getBarColors(selectedIndex) {
            //     return barLabels.map((_, i) => i === selectedIndex ? 'rgba(39, 174, 96, 0.95)' : 'rgba(189, 195, 199, 0.35)');
            // }

            // window.barInstance = new Chart(ctxBar, {
            //     type: 'bar',
            //     data: {
            //         labels: barLabels,
            //         datasets: [{
            //             label: 'คะแนน Overall (%)',
            //             data: barValues,
            //             backgroundColor: getBarColors(0),
            //             borderWidth: 1
            //         }]
            //     },
            //     options: {
            //         responsive: true,
            //         maintainAspectRatio: false,
            //         plugins: { 
            //             legend: { display: false },
            //             title: { display: true, text: `หน่วยงาน: ${rawData[0].label} (ปี ${selectedYear})`, font: { size: 16, family: 'Prompt' } }
            //         },
            //         scales: {
            //             x: { grid: { display: false }, ticks: { display: false } },
            //             y: { beginAtZero: true, max: 100 }
            //         }
            //     }
            // });

            // 2. ฟังก์ชันอัปเดตทุกอย่างเมื่อเปลี่ยน Dropdown หน่วยงาน
            window.updateDashboard = function(index) {
                const selectedData = rawData[index];
                const details = selectedData.details || [];
                const pieScores = details.slice(0, 7).map(val => (val === "" || val === "-") ? 0 : Number(val));
                
                // window.barInstance.options.plugins.title.text = `หน่วยงานที่เลือก: ${selectedData.label} (ปี ${selectedYear})`;
                // window.barInstance.data.datasets[0].backgroundColor = getBarColors(Number(index));
                // window.barInstance.update();

                document.getElementById('pieTitle').textContent = `สัดส่วนคะแนนแต่ละหมวดของ: ${selectedData.label}`;                
                document.getElementById('overallScoreText').textContent = parseFloat(selectedData.value).toFixed(2) + '%';
                
                const rating = getRatingRank(selectedData.value);
                const badge = document.getElementById('ratingBadge');
                badge.textContent = rating.text;
                badge.style.backgroundColor = rating.color;

                for (let i = 1; i <= 7; i++) {
                    let val = details[i - 1];
                    document.getElementById(`score${i}`).textContent = (val === 0 || val === "" || val === "-") ? "-" : Number(val).toFixed(2);
                }

                if (window.pieInstance) window.pieInstance.destroy();
                window.pieInstance = new Chart(document.getElementById('pieChart').getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['หมวด 1 (องค์กร)', 'หมวด 2 (วัตถุดิบ)', 'หมวด 3 (พลังงาน)', 'หมวด 4 (น้ำ)', 'หมวด 5 (กากของเสีย)', 'หมวด 6 (อาคาร)', 'หมวด 7 (ก๊าซฯ)'],
                        datasets: [{ data: pieScores, backgroundColor: ['#27ae60', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6', '#e67e22', '#1abc9c'] }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                });
            };

            // Setup Dropdown หน่วยงาน
            const selectElement = document.getElementById('unitSelect');
            selectElement.innerHTML = '';
            rawData.forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = item.label;
                selectElement.appendChild(option);
            });

            selectElement.addEventListener('change', (e) => updateDashboard(e.target.value));
            updateDashboard(0);
        }
    } catch (error) { console.error('Error:', error); }
}

function getRatingRank(score) {
    if (score >= 80) return { text: 'Best', color: '#27ae60' };
    if (score >= 60) return { text: 'Good', color: '#2980b9' };
    if (score >= 40) return { text: 'Moderate', color: '#f39c12' };
    if (score >= 20) return { text: 'Limited', color: '#d35400' };
    return { text: 'Unacceptable', color: '#c0392b' };
}

// 1. โหลดข้อมูลเริ่มต้น
loadCharts("2025");

// 2. ดักจับเหตุการณ์เมื่อเปลี่ยนปี
const yearSelect = document.getElementById('yearSelect');
if (yearSelect) {
    yearSelect.addEventListener('change', (e) => loadCharts(e.target.value));
}