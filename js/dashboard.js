// js/dashboard.js
import { fetchTransactionsFromSheet, fetchInventoryFromSheet } from './api.js';

export async function renderDashboard(container) {
    // 1. Initial UI Loading State & HTML Structure
    container.innerHTML = `
        <div class="module-wrapper">
            <!-- Dashboard Header & Top Month Filter Search Box -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 25px;">
                <div>
                    <h2 style="margin: 0 0 5px 0;">📊 Dashboard Overview</h2>
                    <p style="color: var(--text-muted); margin: 0;">Summary of fuel entries and statistics from Google Sheets.</p>
                </div>
                
                <!-- Dashboard Top Month Filter Dropdown -->
                <div style="display: flex; align-items: center; gap: 10px; background: var(--glass-bg); padding: 8px 14px; border-radius: 10px; border: 1px solid var(--glass-border);">
                    <label for="month-filter" style="font-size: 13px; font-weight: 600; color: var(--text-muted); white-space: nowrap;">📅 Select Month:</label>
                    <select id="month-filter" class="form-control" style="padding: 6px 12px; font-size: 13px; width: auto; border-radius: 8px; cursor: pointer; border: 1px solid var(--input-border); background: var(--input-bg);">
                        <option value="ALL">All Months</option>
                    </select>
                </div>
            </div>
            
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
                <div class="glass-panel" style="padding: 25px; border-radius: 16px; margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 18px;">📑 Fuel Transactions & Vouchers</h3>
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

                <!-- 📊 Stock Status Overview Table View Section -->
                <div class="glass-panel" style="padding: 25px; border-radius: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 18px;">📊 Stock Status Overview</h3>
                    </div>

                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 2px solid rgba(150,150,150,0.3); background: rgba(150,150,150,0.05);">
                                    <th style="padding: 12px; font-weight: 600;">Item Name</th>
                                    <th style="padding: 12px; font-weight: 600; text-align: right;">Total IN / Capacity</th>
                                    <th style="padding: 12px; font-weight: 600; text-align: right;">Total OUT</th>
                                    <th style="padding: 12px; font-weight: 600; text-align: right;">Current Balance</th>
                                    <th style="padding: 12px; font-weight: 600; text-align: center;">Status</th>
                                </tr>
                            </thead>
                            <tbody id="stock-table-tbody">
                                <!-- Dynamic stock rows -->
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

    // 2. Fetch Data Parallelly from Google Sheet API
    let entries = [];
    let inventory = [];

    try {
        const [transData, invData] = await Promise.all([
            fetchTransactionsFromSheet(),
            typeof fetchInventoryFromSheet === 'function' ? fetchInventoryFromSheet().catch(() => []) : Promise.resolve([])
        ]);
        entries = Array.isArray(transData) ? transData : (transData?.data || []);
        inventory = Array.isArray(invData) ? invData : (invData?.data || []);
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

    // 3. Helper Functions Section
    const monthsNameArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const getMonthYearKey = (dateStr) => {
        if (!dateStr) return 'Unknown';
        
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const monthIdx = parseInt(parts[1], 10) - 1;
                if (monthIdx >= 0 && monthIdx < 12) {
                    return `${monthsNameArr[monthIdx]} ${parts[2]}`;
                }
            }
        }
        
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            return `${monthsNameArr[d.getMonth()]} ${d.getFullYear()}`;
        }
        return 'Other';
    };

    const formatDateToDDMMMYYYY = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = monthsNameArr[d.getMonth()];
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    // 4. Dynamic Statistics Cards Render Function
    const renderStatsCards = (data) => {
        const totalEntries = data.length;
        const totalLiters = data.reduce((sum, item) => sum + (parseFloat(item.liter) || 0), 0);
        const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

        document.getElementById('stat-entries').innerText = totalEntries.toLocaleString();
        document.getElementById('stat-liters').innerText = `${totalLiters.toLocaleString()} L`;
        document.getElementById('stat-amount').innerText = `${totalAmount.toLocaleString()} MMK`;
    };

    // 5. Dynamic Department Chart Render Function
    const renderDepartmentChart = (data) => {
        const deptSummary = {};
        data.forEach(item => {
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
    };

    // 6. Dynamic Fuel Transactions Table Render Function
    const tbody = document.getElementById('entries-table-tbody');
    const renderTableEntries = (dataToRender) => {
        tbody.innerHTML = '';
        
        if (dataToRender.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">ရွေးချယ်ထားသော လတွင် ဒေတာ မရှိပါ။</td></tr>`;
            return;
        }

        [...dataToRender].reverse().forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(150,150,150,0.15)';

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

        // Photo Click Modal Trigger
        document.querySelectorAll('.view-photo-btn').forEach(img => {
            img.addEventListener('click', (e) => {
                const modal = document.getElementById('image-modal');
                const modalImg = document.getElementById('modal-img');
                modalImg.src = e.target.getAttribute('data-src');
                modal.style.display = 'flex';
            });
        });
    };

    // 7. Dynamic Stock Status Overview Table Render Function (Grouped & Aggregated)
    const stockTbody = document.getElementById('stock-table-tbody');
    const renderStockStatusTable = (invData, allEntries) => {
        stockTbody.innerHTML = '';

        const actualInvData = Array.isArray(invData) ? invData : [];

        if (actualInvData.length === 0) {
            // Inventory Sheet မရှိပါက (သို့မဟုတ် မရရှိသေးပါက) Transactions Data အားလုံးမှ Total Issued ကို တွက်ချက်ပြသခြင်း
            const totalIssuedLiters = allEntries.reduce((sum, item) => sum + (parseFloat(item.liter) || 0), 0);
            
            stockTbody.innerHTML = `
                <tr style="border-bottom: 1px solid rgba(150,150,150,0.15);">
                    <td style="padding: 12px; font-weight: 600;">⛽ Main Fuel Tank (Diesel)</td>
                    <td style="padding: 12px; text-align: right; font-weight: 500;">-</td>
                    <td style="padding: 12px; text-align: right; color: #ef4444; font-weight: 600;">${totalIssuedLiters.toLocaleString()} L</td>
                    <td style="padding: 12px; text-align: right; color: #2563eb; font-weight: 600;">-</td>
                    <td style="padding: 12px; text-align: center;">
                        <span style="background: rgba(59,130,246,0.15); color: #3b82f6; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">Active</span>
                    </td>
                </tr>
            `;
            return;
        }

        // Item Code သို့မဟုတ် Item Name အလိုက် ဒေတာများကို Group ဖွဲ့ရန် Map တည်ဆောက်ခြင်း
        const summaryMap = {};

        actualInvData.forEach(item => {
            const code = item.itemCode || item.itemName || item.fuelType || item.name || "UNKNOWN";
            const itemName = item.itemName || item.fuelType || item.name || item['Fuel/Item Name'] || 'Fuel Item';

            if (!summaryMap[code]) {
                summaryMap[code] = {
                    itemName: itemName,
                    inQty: 0,
                    outQty: 0,
                    // Direct summary values များ ပါဝင်ပါက ယူရန်
                    capacity: parseFloat(item.capacity || item.totalReceived || item.openingStock || item.received) || 0,
                    issued: parseFloat(item.totalIssued || item.usedLiter || item.issued) || 0,
                    hasDirectSummary: (item.capacity !== undefined || item.totalReceived !== undefined || item.totalIssued !== undefined || item.currentStock !== undefined)
                };
            }

            const qty = parseFloat(item.quantity) || 0;
            const itemType = (item.type || item.Type || "").toUpperCase();

            if (itemType === 'IN') {
                summaryMap[code].inQty += qty;
            } else if (itemType === 'OUT') {
                summaryMap[code].outQty += qty;
            }
        });

        // Group ထားသော အချက်အလက်များအတိုင်း Table Rows Render ပြုလုပ်ခြင်း
        Object.keys(summaryMap).forEach(code => {
            const item = summaryMap[code];

            const capacity = item.hasDirectSummary && item.capacity > 0 ? item.capacity : item.inQty;
            const issued = item.hasDirectSummary && item.issued > 0 ? item.issued : item.outQty;
            const currentStock = capacity - issued;

            let statusBadge = `<span style="background: rgba(34,197,94,0.15); color: #22c55e; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">In Stock</span>`;
            if (currentStock <= 0) {
                statusBadge = `<span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">Out of Stock</span>`;
            } else if (capacity > 0 && currentStock < capacity * 0.2) {
                statusBadge = `<span style="background: rgba(234,179,8,0.15); color: #eab308; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">Low Stock</span>`;
            }

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(150,150,150,0.15)';
            tr.innerHTML = `
                <td style="padding: 12px; font-weight: 600;">📦 ${item.itemName}</td>
                <td style="padding: 12px; text-align: right; font-weight: 500;">${capacity.toLocaleString()}</td>
                <td style="padding: 12px; text-align: right; color: #ef4444; font-weight: 600;">${issued.toLocaleString()}</td>
                <td style="padding: 12px; text-align: right; color: #2563eb; font-weight: 600;">${currentStock.toLocaleString()}</td>
                <td style="padding: 12px; text-align: center;">${statusBadge}</td>
            `;
            stockTbody.appendChild(tr);
        });
    };

    // 8. Master Function - Dashboard တစ်ခုလုံးအား အသစ်ပြန်လည် ရေးဆွဲပေးမည့် Function
    const updateDashboardView = (filteredEntries) => {
        renderStatsCards(filteredEntries);
        renderDepartmentChart(filteredEntries);
        renderTableEntries(filteredEntries);
        
        // Stock Table တွင် Date Filter မပါစေဘဲ Total `entries` ကိုသာ အမြဲတမ်း ပေးပို့ပါသည်
        renderStockStatusTable(inventory, entries);
    };

    // 9. Month Filter Dropdown သို့ Data များ ထည့်သွင်းခြင်း
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

    // 10. Initial Render Logic
    const now = new Date();
    const currentMonthKey = `${monthsNameArr[now.getMonth()]} ${now.getFullYear()}`;

    if (uniqueMonths.includes(currentMonthKey)) {
        monthSelect.value = currentMonthKey;
        const initialFiltered = entries.filter(item => getMonthYearKey(item.filledDate) === currentMonthKey);
        updateDashboardView(initialFiltered);
    } else {
        monthSelect.value = 'ALL';
        updateDashboardView(entries);
    }

    // 11. Filter Change Event Handler
    monthSelect.addEventListener('change', (e) => {
        const selectedMonth = e.target.value;
        if (selectedMonth === 'ALL') {
            updateDashboardView(entries);
        } else {
            const filtered = entries.filter(item => getMonthYearKey(item.filledDate) === selectedMonth);
            updateDashboardView(filtered);
        }
    });

    // 12. Modal Close Events
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('image-modal').style.display = 'none';
    });
    document.getElementById('image-modal').addEventListener('click', (e) => {
        if (e.target.id === 'image-modal') {
            document.getElementById('image-modal').style.display = 'none';
        }
    });
}