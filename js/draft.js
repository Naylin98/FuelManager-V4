// js/draft.js

const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyA1EOVzwjY-6I0-9az4h9MwI0_gMxxfyviqxtRvLyzQgQzCwFqgSjSX5_na2X6m11Z/exec'; 

export function renderDraftModule(container) {
    container.innerHTML = `
        <div class="module-wrapper">
            <h2 style="margin-bottom: 10px;">☁️ Data Management & Drafts</h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">Manage your local drafts and Google Sheets records.</p>
            
            <!-- 📝 Local Drafts Section (New) -->
            <div class="glass-panel" style="padding: 20px; border-radius: 16px; margin-bottom: 30px; overflow-x: auto;">
                <h3 style="margin-bottom: 15px; color: #d97706;">📝 Local Drafts (Not Saved to Sheet)</h3>
                <div class="draft-table-container">
                    <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: rgba(150,150,150,0.08); border-bottom: 2px solid rgba(150,150,150,0.2);">
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">ID</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Filled Date</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; width: 25%; min-width: 150px;">Itineraries</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Boat ID</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Department</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Issued Date</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Price/Drum</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Liter</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Total Amount</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="local-drafts-body">
                            <!-- Draft rows will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <hr style="border-color: rgba(150,150,150,0.2); margin: 30px 0;">

            <!-- ☁️ Google Sheets Records Section (Existing) -->
            <div class="glass-panel" style="padding: 20px; border-radius: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
                <div>
                    <label for="month-filter" style="margin-right: 10px; font-weight: 500;">Select Month:</label>
                    <input type="month" id="month-filter" class="form-control" style="width: auto; display: inline-block;">
                </div>
                <button id="btn-fetch-data" class="btn-primary" style="padding: 10px 20px;">Load Sheet Data</button>
            </div>

            <div class="glass-panel" style="padding: 20px; border-radius: 16px; overflow-x: auto;">
                <h3 style="margin-bottom: 15px; color: #2563eb;">☁️ Google Sheets Records</h3>
                <div class="draft-table-container">
                    <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: rgba(150,150,150,0.08); border-bottom: 2px solid rgba(150,150,150,0.2);">
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">ID</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Filled Date</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; width: 25%; min-width: 150px;">Itineraries</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Boat ID</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; width: 25%; min-width: 150px;">Departments</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Issued Date</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Price/Drum</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Liter</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Price/Liter</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Total Amount</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Marks</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Photo</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Voc Amount</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Created At</th>
                                <th style="padding: 8px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="sheet-data-body">
                            <tr><td colspan="15" style="text-align: center; color: var(--text-muted); padding: 30px;">Select a month and click "Load Sheet Data"</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Date Format Helper (dd/mmm/yyyy)
    const formatDateToCustom = function(val) {
        if (!val) return '-';
        let cleanVal = String(val).trim();
        // Handle ISO timestamps or standard strings
        const dateObj = new Date(cleanVal);
        if (isNaN(dateObj.getTime())) {
            // If it can't be parsed directly, return as is or truncated
            return cleanVal.includes('T') ? cleanVal.replace('T', ' ').slice(0, 16) : cleanVal;
        }
        
        const day = String(dateObj.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // ==========================================
    // 1. Local Drafts လုပ်ဆောင်ချက်များ
    // ==========================================
    function loadLocalDrafts() {
        const tbody = document.getElementById('local-drafts-body');
        const drafts = JSON.parse(localStorage.getItem('fuel_drafts') || '[]');

        if (drafts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 30px; font-size: 11px;">No local drafts found.</td></tr>';
            return;
        }

        let rows = [];
        [...drafts].reverse().forEach((item, index) => {
            const originalIndex = drafts.length - 1 - index; 
            
            rows.push(`
                <tr style="border-bottom: 1px solid rgba(150,150,150,0.1);">
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${item.id || '-'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${formatDateToCustom(item.filledDate)}</td>
                    <td style="padding: 7px 10px; font-size: 11px; width: 25%; word-break: break-word; white-space: normal;">${item.itineraries || '-'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${item.boatId || '-'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${item.department || '-'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${formatDateToCustom(item.issuedDate)}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${item.priceDrum ? parseFloat(item.priceDrum).toLocaleString() + ' Ks' : '0 Ks'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${item.liter || 0} L</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${item.totalAmount ? parseFloat(item.totalAmount).toLocaleString() + ' Ks' : '0 Ks'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">
                        <div style="display: flex; gap: 5px;">
                            <button class="btn-edit-draft" data-index="${originalIndex}" style="padding: 3px 7px; font-size: 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                            <button class="btn-delete-draft" data-index="${originalIndex}" style="padding: 3px 7px; font-size: 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                        </div>
                    </td>
                </tr>
            `);
        });
        
        tbody.innerHTML = rows.join('');

        tbody.querySelectorAll('.btn-edit-draft').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                let currentDrafts = JSON.parse(localStorage.getItem('fuel_drafts') || '[]');
                const draftToEdit = currentDrafts[idx];
                
                localStorage.setItem('editing_sheet_data', JSON.stringify(draftToEdit));
                window.location.hash = '#/fuel';
            });
        });

        tbody.querySelectorAll('.btn-delete-draft').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('Are you sure you want to permanently delete this local draft?')) {
                    const idx = e.target.getAttribute('data-index');
                    let currentDrafts = JSON.parse(localStorage.getItem('fuel_drafts') || '[]');
                    currentDrafts.splice(idx, 1);
                    localStorage.setItem('fuel_drafts', JSON.stringify(currentDrafts));
                    loadLocalDrafts();
                }
            });
        });
    }

    loadLocalDrafts();


    // ==========================================
    // 2. Google Sheets Data လုပ်ဆောင်ချက်များ (မူလအတိုင်း)
    // ==========================================
    let fetchedData = [];

    document.getElementById('btn-fetch-data').addEventListener('click', async () => {
        const tbody = document.getElementById('sheet-data-body');
        const monthFilter = document.getElementById('month-filter').value;
        
        tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; padding: 30px; font-size: 11px;">Loading data from Google Sheets... ⏳</td></tr>';

        try {
            const response = await fetch(GOOGLE_APP_SCRIPT_URL);
            const data = await response.json();
            
            console.log("Fetched Data from Sheet:", data);
            fetchedData = data;
            
            if (monthFilter) {
                fetchedData = data.filter(item => {
                    const filled = String(item.filledDate || item.FilledDate || '').trim();
                    return filled.startsWith(monthFilter);
                });
            }

            renderTable(fetchedData, tbody);
        } catch (error) {
            console.error('Fetch error:', error);
            tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; color: #ef4444; padding: 30px; font-size: 11px;">⚠️ Failed to load data. Please check internet or URL.</td></tr>';
        }
    });

    function renderTable(dataArray, tbody) {
        if (!dataArray || dataArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; color: var(--text-muted); padding: 30px; font-size: 11px;">No records found for the selected month.</td></tr>';
            return;
        }

        let rows = [];
        [...dataArray].reverse().forEach(function(item) {
            const itemId = item.id || item.ID || 'N/A';
            const filledDate = item.filledDate || item.FilledDate || '';
            const itineraries = item.issuedDate || item.IssuedDate || '-';
            const boatId = item.boatId || item.BoatID || item['Boat ID'] || 'N/A';
            
            const department = item.itineraries || item.Itineraries || '-';
            const issuedDate = item.priceDrum || item.PriceDrum || item['Price/Drum'] || ''; 
            const priceDrum = item.priceLiter || item.PriceLiter || item['Price/Liter'] || 0; 
            const liter = item.liter || item.Liter || 0; 
            const priceLiter = item.vocAmount || item.VocAmount || item['Voc Amount'] || 0; 
            const totalAmount = item.totalAmount || item.TotalAmount || item['Total Amount'] || 0;
            const marks = item.marks || item.Marks || '-';
            const photo = item.photo || item.Photo || '';
            const vocAmount = null; 
            const createdAt = item.createdAt || item.CreatedAt || '';

            let photoHtml = '<span style="color: var(--text-muted); font-size: 10px;">No Photo</span>';
            if (photo && photo.trim() !== '') {
                let thumbUrl = photo;
                let fileId = "";

                if (photo.includes('/d/')) {
                    const match = photo.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) fileId = match[1];
                } else if (photo.includes('id=')) {
                    const match = photo.match(/id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) fileId = match[1];
                }

                if (fileId) {
                    thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`;
                }

                photoHtml = `<a href="${photo}" target="_blank" style="display: inline-block;">
                    <img src="${thumbUrl}" alt="Photo" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(150,150,150,0.3); background: #e5e7eb; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.5)'" onmouseout="this.style.transform='scale(1)'" title="Click to view full image" onerror="this.onerror=null; this.src='https://placehold.co/40x40/e5e7eb/a3a3a3?text=Error';">
                </a>`;
            }

            rows.push(`
                <tr style="border-bottom: 1px solid rgba(150,150,150,0.1);">
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${itemId}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${formatDateToCustom(filledDate)}</td>
                    <td style="padding: 7px 10px; font-size: 11px; width: 25%; word-break: break-word; white-space: normal;">${itineraries}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${boatId}</td>
                    <td style="padding: 7px 10px; font-size: 11px; width: 25%; word-break: break-word; white-space: normal;">${department}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${formatDateToCustom(issuedDate)}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${priceDrum}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${liter ? liter + ' L' : '0 L'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${priceLiter ? parseFloat(priceLiter).toLocaleString() + ' Ks' : '0 Ks'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${totalAmount ? parseFloat(totalAmount).toLocaleString() + ' Ks' : '0 Ks'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${marks}</td>
                    <td style="padding: 5px 10px; font-size: 11px; white-space: nowrap;">${photoHtml}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${vocAmount !== null && vocAmount !== '' ? parseFloat(vocAmount).toLocaleString() + ' Ks' : '-'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">${createdAt ? formatDateToCustom(createdAt) : '-'}</td>
                    <td style="padding: 7px 10px; font-size: 11px; white-space: nowrap;">
                        <div style="display: flex; gap: 5px;">
                            <button class="btn-action btn-edit" data-id="${itemId}" style="padding: 3px 7px; font-size: 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                            <button class="btn-action btn-delete" data-id="${itemId}" style="padding: 3px 7px; font-size: 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                        </div>
                    </td>
                </tr>
            `);
        });
        tbody.innerHTML = rows.join('');

        tbody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const itemToEdit = fetchedData.find(d => (d.id === id || d.ID === id));
                
                const mappedItem = {
                    id: itemToEdit.id || itemToEdit.ID || '',
                    filledDate: itemToEdit.filledDate || itemToEdit.FilledDate || '',
                    itineraries: itemToEdit.issuedDate || itemToEdit.IssuedDate || '',
                    boatId: itemToEdit.boatId || itemToEdit.BoatID || itemToEdit['Boat ID'] || '',
                    department: itemToEdit.itineraries || itemToEdit.Itineraries || '',
                    issuedDate: itemToEdit.priceDrum || itemToEdit.PriceDrum || itemToEdit['Price/Drum'] || '',
                    priceDrum: itemToEdit.priceLiter || itemToEdit.PriceLiter || itemToEdit['Price/Liter'] || '',
                    liter: itemToEdit.liter || itemToEdit.Liter || '',
                    priceLiter: itemToEdit.vocAmount || itemToEdit.VocAmount || itemToEdit['Voc Amount'] || '',
                    totalAmount: itemToEdit.totalAmount || itemToEdit.TotalAmount || itemToEdit['Total Amount'] || '',
                    marks: itemToEdit.marks || itemToEdit.Marks || '',
                    photo: itemToEdit.photo || itemToEdit.Photo || '',
                    vocAmount: null, 
                    createdAt: itemToEdit.createdAt || itemToEdit.CreatedAt || ''
                };
                
                localStorage.setItem('editing_sheet_data', JSON.stringify(mappedItem));
                window.location.hash = '#/fuel';
            });
        });

        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm('Are you sure you want to permanently delete this record from Google Sheets?')) {
                    const id = e.target.getAttribute('data-id');
                    e.target.innerText = '...';
                    e.target.disabled = true;
                    try {
                        await fetch(GOOGLE_APP_SCRIPT_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                            body: JSON.stringify({ action: 'delete', data: { id: id } })
                        });
                        alert('✅ Record deleted successfully!');
                        document.getElementById('btn-fetch-data').click(); 
                    } catch(err) {
                        alert('⚠️ Delete failed.');
                        e.target.innerText = 'Delete';
                        e.target.disabled = false;
                    }
                }
            });
        });
    }
}