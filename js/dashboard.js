// js/dashboard.js
import { fetchTransactionsFromSheet } from './api.js';

export async function renderDashboard(container) {
    // 1. Initial UI Loading State & HTML Structure
    container.innerHTML = `
        <div class="module-wrapper">
            <h2 style="margin-bottom: 10px;">📊 Dashboard Overview</h2>
            <p style="color: var(--text-muted); margin-bottom: 25px;">Summary of fuel entries and statistics from Google Sheets.</p>
            
            <div id="dashboard-loading" style="text-align: center; padding: 50px; color: var(--text-muted);">
                <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
                <p>Loading Dashboard Data from Google Sheet...</p>
            </div>
            
            <div id="dashboard-content" style="display: none;">
                <!-- Statistics Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="glass-panel" style="padding: 20px; border-radius: 12px;">
                        <span style="font-size: 24px;">📝</span>
                        <h4 style="color: var(--text-muted); margin: 10px 0 5px 0; font-size: 14px;">Total Entries</h4>
                        <h3 id="stat-entries" style="font-size: 24px; margin: 0;">0</h3>
                    </div>
                    <div class="glass-panel" style="padding: 20px; border-radius: 12px;">
                        <span style="font-size: 24px;">💧</span>
                        <h4 style="color: var(--text-muted); margin: 10px 0 5px 0; font-size: 14px;">Total Liters</h4>
                        <h3 id="stat-liters" style="font-size: 24px; margin: 0;">0 L</h3>
                    </div>
                    <div class="glass-panel" style="padding: 20px; border-radius: 12px;">
                        <span style="font-size: 24px;">💰</span>
                        <h4 style="color: var(--text-muted); margin: 10px 0 5px 0; font-size: 14px;">Total Amount</h4>
                        <h3 id="stat-amount" style="font-size: 24px; margin: 0;">0 MMK</h3>
                    </div>
                </div>

                <!-- Department Chart Section -->
                <div class="glass-panel" style="padding: 25px; border-radius: 16px; margin-bottom: 30px;">
                    <h3 style="margin-bottom: 20px; font-size: 18px;">🏢 Department-wise Fuel Consumption (Liters)</h3>
                    <div style="position: relative; height: 320px; width: 100%;">
                        <canvas id="deptChart"></canvas>
                    </div>
                </div>

                <!-- Monthly Fuel Entries Table View Section -->
                <div class="glass-panel" style="padding: 25px; border-radius: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 18px;">📅 Monthly Fuel Transactions & Vouchers</h3>
                        
                        <!-- Month Filter Dropdown -->
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label for="month-filter" style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Filter Month:</label>
                            <select id="month-filter" class="form-control" style="padding: 6px 12px; font-size: 13px; width: auto; border-radius: 8px;">
                                <option value="ALL">All Months</option>
                            </select>
                        </div>
                    </div>

                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; table-layout: fixed;">
                            <thead>
                                <tr style="border-bottom: 2px solid rgba(150,150,150,0.3); background: rgba(150,150,150,0.05);">
                                    <th style="padding: 12px; font-weight: 600; white-space: nowrap; width: 19%;">ID</th>
                                    <th style="padding: 12px; font-weight: 600; white-space: nowrap; width: 12%;">Filled Date</th>
                                    <th style="padding: 12px; font-weight: 600; white-space: nowrap; width: 25%;">Itineraries</th>
                                    <th style="padding: 12px; font-weight: 600; white-space: nowrap; width: 12%;">Boat ID</th>
                                    <th style="padding: 12px; font-weight: 600; white-space: nowrap; width: 15%;">Departments</th>                                    
                                    <th style="padding: 12px; font-weight: 600; text-align: right; white-space: nowrap; width: 11%;">Liter</th>
                                    <th style="padding: 12px; font-weight: 600; text-align: right; white-space: nowrap; width: 15%;">Total Amount</th>
                                    <th style="padding: 12px; font-weight: 600; text-align: center; white-space: nowrap; width: 14%;">Photo</th>
                                </tr>
                            </thead>
                            <tbody id="entries-table-tbody">
                                <!-- Dynamic transaction rows -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Photo ကြည့်ရှုရန် Modal Popup -->
        <div id="image-modal" style="display:none; position:fixed; z-index:9999; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center;">
            <div style="position:relative; max-width:90%; max-height:90%;">
                <img id="modal-img" src="" style="max-width:100%; max-height:85vh; border-radius:8px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">
                <button id="close-modal" style="position:absolute; top:-15px; right:-15px; background:#ef4444; color:white; border:none; border-radius:50%; width:30px; height:30px; font-size:14px; font-weight:bold; cursor:pointer;">✕</button>
            </div>
        </div>
    `;

    // 2. Fetch Data from Google Sheet API
    let entries = [];
    try {
        entries = await fetchTransactionsFromSheet();
    } catch (err) {
        console.error("Dashboard Data Fetch Error:", err);
        document.getElementById('dashboard-loading').innerHTML = `
            <p style="color: #ef4444;">⚠️ Google Sheet မှ ဒေတာရယူရာတွင် အမှားအယွင်းရှိနေပါသည်။</p>
        `;
        return;
    }

    if (!entries || entries.length === 0) {
        document.getElementById('dashboard-loading').innerHTML = `
            <p style="color: var(--text-muted);">Data မရှိသေးပါ။</p>
        `;
        return;
    }

    document.getElementById('dashboard-loading').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';

    // 3. Overall Statistics တွက်ချက်ခြင်း
    const totalEntries = entries.length;
    const totalLiters = entries.reduce((sum, item) => sum + (parseFloat(item.liter) || 0), 0);
    const totalAmount = entries.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    document.getElementById('stat-entries').innerText = totalEntries.toLocaleString();
    document.getElementById('stat-liters').innerText = `${totalLiters.toLocaleString()} L`;
    document.getElementById('stat-amount').innerText = `${totalAmount.toLocaleString()} MMK`;

    // 4. Department Chart ဆွဲသားခြင်း
    const deptSummary = {};
    entries.forEach(item => {
        const dept = item.department ? item.department.trim() : 'General / Unassigned';
        deptSummary[dept] = (deptSummary[dept] || 0) + (parseFloat(item.liter) || 0);
    });

    const labels = Object.keys(deptSummary);
    const litersData = Object.values(deptSummary);

    const colorPalette = [
        'rgba(54, 162, 235, 0.75)',
        'rgba(255, 99, 132, 0.75)',
        'rgba(75, 192, 192, 0.75)',
        'rgba(255, 206, 86, 0.75)',
        'rgba(153, 102, 255, 0.75)',
        'rgba(255, 159, 64, 0.75)',
        'rgba(46, 204, 113, 0.75)'
    ];

    const bgColors = labels.map((_, idx) => colorPalette[idx % colorPalette.length]);
    const borderColors = bgColors.map(c => c.replace('0.75', '1.0'));

    const ctx = document.getElementById('deptChart').getContext('2d');
    if (window.myDeptChart instanceof Chart) {
        window.myDeptChart.destroy();
    }

    window.myDeptChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Liters',
                data: litersData,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Liters (L)' } },
                x: { title: { display: true, text: 'Departments' } }
            }
        }
    });

    // 5. Date မှ "MMM YYYY" ထုတ်ပေးသည့် Helper (Filter အတွက်)
    const getMonthYearKey = (dateStr) => {
        if (!dateStr) return 'Unknown';
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[1]} ${parts[2]}`;
        }
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${months[d.getMonth()]} ${d.getFullYear()}`;
        }
        return 'Other';
    };

    // 5.1 Date ကို dd/mmm/yyyy ပုံစံပြောင်းပေးမည့် Helper Function
    const formatDateToDDMMMYYYY = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    // 6. Month Filter Dropdown သို့ ထည့်သွင်းခြင်း
    const monthSelect = document.getElementById('month-filter');
    const uniqueMonths = [...new Set(entries.map(item => getMonthYearKey(item.filledDate)))];
    
    uniqueMonths.forEach(mKey => {
        if (mKey !== 'Unknown' && mKey !== 'Other') {
            const opt = document.createElement('option');
            opt.value = mKey;
            opt.textContent = mKey;
            monthSelect.appendChild(opt);
        }
    });

    // 7. Table ဒေတာပြသပေးသည့် Function
    const tbody = document.getElementById('entries-table-tbody');

    const renderTableEntries = (dataToRender) => {
        tbody.innerHTML = '';
        
        if (dataToRender.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">ရွေးချယ်ထားသော လတွင် ဒေတာ မရှိပါ။</td></tr>`;
            return;
        }

        dataToRender.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(150,150,150,0.15)';

            // Photo Thumbnail View Card & Google Drive Link Conversion
            let photoHtml = `
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 8px; background: rgba(150,150,150,0.1); border: 1px dashed rgba(150,150,150,0.3); color: var(--text-muted); font-size: 10px;">
                    No Photo
                </div>
            `;

            if (item.photo) {
                let imgUrl = String(item.photo).trim();

                if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
                    photoHtml = `
                        <div style="position: relative; display: inline-block; width: 46px; height: 46px; border-radius: 8px; overflow: hidden; border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 3px 6px rgba(0,0,0,0.15); cursor: pointer; background: #000;">
                            <img src="${imgUrl}" class="view-photo-btn" data-src="${imgUrl}" 
                                 style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.25s ease;" 
                                 title="Click to view full voucher"
                                 onmouseover="this.style.transform='scale(1.15)';"
                                 onmouseout="this.style.transform='scale(1.0)';" 
                                 onerror="this.onerror=null; this.parentElement.innerHTML='<a href=\'${imgUrl}\' target=\'_blank\' style=\'font-size:9px; color:#3b82f6; display:flex; align-items:center; justify-content:center; height:100%; text-decoration:underline; text-align:center; padding:2px;\'>Open Link</a>';" />
                        </div>
                    `;
                }
            }

            const literVal = parseFloat(item.liter) || 0;
            const totalAmtVal = parseFloat(item.totalAmount) || 0;
            
            // ရက်စွဲကို dd/mmm/yyyy ပုံစံသို့ ပြောင်းလဲအသုံးပြုခြင်း
            const formattedDate = formatDateToDDMMMYYYY(item.filledDate);

            tr.innerHTML = `
                <td style="padding: 10px 12px; font-weight: 600; font-size: 11px; white-space: nowrap;">${item.id || '-'}</td>
                <td style="padding: 10px 12px; font-size: 12px; font-weight: 500; white-space: nowrap;">${formattedDate}</td>
                <td style="padding: 10px 12px; font-size: 11px; font-weight: 500; word-break: break-word; overflow-wrap: break-word;" title="${item.itineraries || ''}">${item.itineraries || '-'}</td>
                <td style="padding: 10px 12px; white-space: nowrap;"><div style="font-weight: 500;">🚤 ${item.boatId || 'N/A'}</div></td>
                <td style="padding: 10px 12px; white-space: nowrap;"><div style="font-size: 11px;">🏢 ${item.department || 'General'}</div></td>               
                <td style="padding: 10px 12px; text-align: right; color: #2563eb; font-weight: 600; white-space: nowrap;">${literVal.toLocaleString()} L</td>
                <td style="padding: 10px 12px; text-align: right; font-weight: 600; white-space: nowrap;">${totalAmtVal.toLocaleString()} MMK</td>
                <td style="padding: 8px 12px; text-align: center; vertical-align: middle; white-space: nowrap;">${photoHtml}</td>
            `;
            tbody.appendChild(tr);
        });

        // Photo ကို နှိပ်ပါက Full Screen ကြည့်နိုင်သည့် Modal Event Listener
        document.querySelectorAll('.view-photo-btn').forEach(img => {
            img.addEventListener('click', (e) => {
                const modal = document.getElementById('image-modal');
                const modalImg = document.getElementById('modal-img');
                modalImg.src = e.target.getAttribute('data-src');
                modal.style.display = 'flex';
            });
        });
    };

    renderTableEntries(entries);

    // Filter Event
    monthSelect.addEventListener('change', (e) => {
        const selectedMonth = e.target.value;
        if (selectedMonth === 'ALL') {
            renderTableEntries(entries);
        } else {
            const filtered = entries.filter(item => getMonthYearKey(item.filledDate) === selectedMonth);
            renderTableEntries(filtered);
        }
    });

    // Modal Close Events
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('image-modal').style.display = 'none';
    });
    document.getElementById('image-modal').addEventListener('click', (e) => {
        if (e.target.id === 'image-modal') {
            document.getElementById('image-modal').style.display = 'none';
        }
    });
}