const urlParams = new URLSearchParams(window.location.search);
const myToken = urlParams.get('token');

// ตารางแปลงชื่อย่อจาก Google Sheet ให้เป็นชื่อภาษาไทยแบบเต็ม
const unitNameMapping = {
    "OPNA": "วิทยาเขตนครสวรรค์ (OPNA)",
    "OPAM": "วิทยาเขตอำนาจเจริญ (OPAM)",
    "ICT": "คณะเทคโนโลยีสารสนเทศและการสื่อสาร (ICT)",
    "MT": "คณะเทคนิคการแพทย์ (MT)",
    "PY": "คณะเภสัชศาสตร์ (PY)",
    "TM": "คณะเวชศาสตร์เขตร้อน (TM)",
    "RA": "คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี (RA)",
    "SI": "คณะแพทยศาสตร์ศิริราชพยาบาล (SI)",
    "PT": "คณะกายภาพบำบัด (PT)",
    "DT": "คณะทันตแพทยศาสตร์ (DT)",
    "NS": "คณะพยาบาลศาสตร์ (NS)",
    "SC": "คณะวิทยาศาสตร์ (SC)",
    "EG": "คณะวิศวกรรมศาสตร์ (EG)",
    "LA": "คณะศิลปศาสตร์ (LA)",
    "SH": "คณะสังคมศาสตร์และมนุษยศาสตร์ (SH)",
    "VS": "คณะสัตวแพทยศาสตร์ (VS)",
    "PH": "คณะสาธารณสุข (PH)",
    "EN": "คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ (EN)",
    "GR": "บัณฑิตวิทยาลัย (GR)",
    "KA": "วิทยาเขตกาญจนบุรี (KA)",
    "CMMU": "วิทยาลัยการจัดการ (CMMU)",
    "MS": "วิทยาลัยดุริยางคศิลป์ (MS)",
    "IC": "คณะเทคโนโลยีสารสนเทศและการสื่อสาร (IC)",
    "SS": "วิทยาลัยวิทยาศาสตร์และเทคโนโลยีการกีฬา (SS)",
    "CRS": "วิทยาลัยศาสนศึกษา (CRS)",
    "GJ": "ศูนย์การแพทย์กาญจนาภิเษก (GJ)",
    "AC": "ศูนย์สัตว์ทดลองแห่งชาติ (AC)",
    "CF": "สถาบันแห่งชาติเพื่อการพัฒนาเด็กและครอบครัว (CF)",
    "NU": "สถาบันโภชนาการ (NU)",
    "MB": "สถาบันชีววิทยาศาสตร์โมเลกุล (MB)",
    "IL": "สถาบันนวัตกรรมการเรียนรู้ (IL)",
    "AD": "สถาบันพัฒนาสุขภาพอาเซียน (AD)",
    "IPSR": "สถาบันวิจัยประชากรและสังคม (IPSR)",
    "LC": "สถาบันวิจัยภาษาและวัฒนธรรมเอเซีย (LC)",
    "DC": "สถาบันวิทยาศาสตร์การวิเคราะห์และตรวจสารในการกีฬา (DC)",
    "OP": "สำนักงานอธิการบดี (OP)",
    "LI": "หอสมุดและคลังความรู้มหาวิทยาลัยมหิดล (LI)"
};

async function loadCharts(selectedYear = "2025") {
    try {
        if (!myToken) {
            alert("กรุณาระบุ Token ใน URL (เช่น ?token=OPNA123)");
            return;
        }

        const baseUrl = 'https://script.google.com/macros/s/AKfycbxeShv6EV9ha8rBQ7x58_oQ1_byQDue2ZSyT4zS5gNjkWhGd8vcCIK-4ONfGJchK0jl/exec'; 
        const apiUrl = `${baseUrl}?year=${selectedYear}&token=${myToken}`;

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status === "success") {
            const rawData = result.data;
            if (!rawData || rawData.length === 0) {
                alert("ไม่พบข้อมูลของหน่วยงานนี้ในปี " + selectedYear);
                return;
            }

            // ฟังก์ชันอัปเดต Dashboard
            window.updateDashboard = function(index) {
                const selectedData = rawData[index];
                const details = selectedData.details || [];
                const pieScores = details.slice(0, 7).map(val => (val === "" || val === "-") ? 0 : Number(val));
                
                // แปลงชื่อย่อให้เป็นชื่อภาษาไทยเต็มเพื่อแสดงที่หัวข้อ
                const fullName = unitNameMapping[selectedData.label] || selectedData.label;

                document.getElementById('pieTitle').textContent = `ข้อมูล: ${fullName} (ปี ${selectedYear})`;
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
                        labels: ['หมวด 1', 'หมวด 2', 'หมวด 3', 'หมวด 4', 'หมวด 5', 'หมวด 6', 'หมวด 7'],
                        datasets: [{ data: pieScores, backgroundColor: ['#27ae60', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6', '#e67e22', '#1abc9c'] }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                });
            };

            const selectElement = document.getElementById('unitSelect');
            selectElement.innerHTML = '';
            
            rawData.forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index;
                // ดึงชื่อภาษาไทยจาก Mapping มาใส่ใน Dropdown ถ้าไม่มีให้ใช้ชื่อเดิมจาก Sheet
                option.textContent = unitNameMapping[item.label] || item.label;
                selectElement.appendChild(option);
            });

            selectElement.onchange = (e) => updateDashboard(e.target.value);
            updateDashboard(0);
        } else {
            alert(result.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
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

loadCharts("2025");
const yearSelect = document.getElementById('yearSelect');
if (yearSelect) yearSelect.onchange = (e) => loadCharts(e.target.value);