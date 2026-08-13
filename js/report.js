import { fetchTransactionsFromSheet, fetchSignature, saveSignature } from './api.js';

// 🌟 ထည့်သွင်းရန် - Department Dropdown ကို Data ထဲမှ ရယူပြီး Fill လုပ်ပေးသည့် Function
async function loadDepartmentsDropdown() {
    try {
        const data = await fetchTransactionsFromSheet();
        const deptSelect = document.getElementById('filter-dept');
        if (!deptSelect) return;

        // Duplicate မဖြစ်အောင် Department များကို Set ဖြင့်စုဆောင်းခြင်း
        const departments = [...new Set(data.map(item => item.department).filter(Boolean))];
        
        // Option များထည့်သွင်းခြင်း
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            deptSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load departments:", error);
    }
}

// 🌟 ထည့်သွင်းရန် - Filter အချက်အလက်များအလျောက် ဇယားကို စစ်ထုတ်ပြသပေးသည့် Function
function applyFiltersAndRender() {
    const selectedDept = document.getElementById('filter-dept').value;
    const selectedMonth = document.getElementById('filter-month').value; 
    const startDateVal = document.getElementById('filter-start').value;
    const endDateVal = document.getElementById('filter-end').value;
    const boatQuery = document.getElementById('filter-boat').value.trim().toLowerCase();

    const filteredData = cachedAllData.filter(row => {
        if (selectedDept && row.department !== selectedDept) return false;
        if (boatQuery && !(row.boatId || '').toLowerCase().includes(boatQuery)) return false;

        const rowDateStr = row.filledDate ? row.filledDate.trim() : '';
        const rowDate = rowDateStr ? new Date(rowDateStr) : null;

        if (selectedMonth && rowDateStr) {
            const [year, month] = selectedMonth.split('-');
            const rYear = rowDate.getFullYear().toString();
            const rMonth = String(rowDate.getMonth() + 1).padStart(2, '0');
            if (rYear !== year || rMonth !== month) return false;
        }
        if (startDateVal && rowDate) {
            const startD = new Date(startDateVal);
            startD.setHours(0, 0, 0, 0);
            if (rowDate < startD) return false;
        }
        if (endDateVal && rowDate) {
            const endD = new Date(endDateVal);
            endD.setHours(23, 59, 59, 999);
            if (rowDate > endD) return false;
        }
        return true;
    });

    const tbody = document.getElementById('report-tbody');
    if (!tbody) return;

    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #888; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                    ရှာဖွေမှုနှင့် ကိုက်ညီသော အချက်အလက် မရှိပါ။
                </td>
            </tr>
        `;
        return;
    }

    // ဇယားထဲသို့ Filter ပြီးသား အချက်အလက်များကို ထည့်သွင်းခြင်း (Pyidaungsu ဖောင့်ဖြင့် မြန်မာစာအမှန်ပေါ်စေရန် သတ်မှတ်ခြင်း)
    tbody.innerHTML = filteredData.map(row => `
        <tr style="font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
            <td style="padding: 10px; border-bottom: 1px solid var(--input-border);">${row.id || '-'}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--input-border);">${row.filledDate || '-'}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--input-border);">${row.itineraries || '-'}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--input-border);">${row.boatId || '-'}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--input-border);">${row.department || '-'}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--input-border);">${row.issuedDate || '-'}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--input-border); text-align: right;">${Number(row.liter || 0).toLocaleString()}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--input-border); text-align: right;">${Number(row.totalAmount || 0).toLocaleString()}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--input-border);">${row.marks || '-'}</td>
        </tr>
    `).join('');
}

export function renderReportModule(container) {
    container.innerHTML = `
        <style>
            /* 🌐 Pyidaungsu Font သတ်မှတ်ချက်များ (ဇယားနှင့် စာသားများအတွက်) */
            .report-container, #report-table {
                font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif !important;
            }

            /* 🌞 Light Mode (Default) အရောင်များ */
            #report-table thead tr {
                background-color: #e3f2fd !important;
            }
            #report-table thead th {
                color: #1F4E78 !important;
                border-bottom: 2px solid #bbdefb !important;
                font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif !important;
            }

            /* 🌙 Dark Mode အရောင်များ */
            body.dark-mode #report-table thead tr,
            body.dark #report-table thead tr,
            [data-theme="dark"] #report-table thead tr,
            .dark-mode #report-table thead tr {
                background-color: #1e293b !important;
            }
            
            body.dark-mode #report-table thead th,
            body.dark #report-table thead th,
            [data-theme="dark"] #report-table thead th,
            .dark-mode #report-table thead th {
                color: #e2e8f0 !important;
                border-bottom: 2px solid #334155 !important;
            }
        </style>

        <div class="report-container">
            <div class="report-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">📊 Fuel Entry Reports</h3>
                
                <div class="export-actions" style="display: flex; gap: 12px; align-items: center;">
                    <button id="btn-export-excel" class="btn-export" style="background-color: #5442f5; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        <span style="font-size: 16px;">📗</span> Export to Excel
                    </button>
                    <button id="btn-export-pdf" class="btn-export" style="background-color: #5442f5; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        <span style="font-size: 16px;">📕</span> Export to PDF
                    </button>
                </div>
            </div>

            <div class="glass-panel" style="padding: 20px; margin-bottom: 24px;">
                <!-- Filter Section -->
                <div class="filter-section" style="display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end; margin-bottom: 20px;">
                    
                    <!-- Department Dropdown -->
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-size: 13px; font-weight: 500;">Department</label>
                        <select id="filter-dept" class="filter-input" style="background-color: var(--input-bg); color: var(--input-text); border: 1px solid var(--input-border); padding: 8px 12px; border-radius: 4px;">
                            <option value="">-- All Departments --</option>
                        </select>
                    </div>

                    <!-- Month Filter -->
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-size: 13px; font-weight: 500;">Month (လချုပ်)</label>
                        <input type="month" id="filter-month" class="filter-input" style="background-color: var(--input-bg); color: var(--input-text); border: 1px solid var(--input-border); padding: 8px 12px; border-radius: 4px;">
                    </div>

                    <!-- Start Date -->
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-size: 13px; font-weight: 500;">Start Date</label>
                        <input type="date" id="filter-start" class="filter-input" style="background-color: var(--input-bg); color: var(--input-text); border: 1px solid var(--input-border); padding: 8px 12px; border-radius: 4px;">
                    </div>

                    <!-- End Date -->
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-size: 13px; font-weight: 500;">End Date</label>
                        <input type="date" id="filter-end" class="filter-input" style="background-color: var(--input-bg); color: var(--input-text); border: 1px solid var(--input-border); padding: 8px 12px; border-radius: 4px;">
                    </div>

                    <!-- Boat ID -->
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-size: 13px; font-weight: 500;">Boat ID</label>
                        <input type="text" id="filter-boat" class="filter-input" placeholder="e.g. BOAT-001" style="background-color: var(--input-bg); color: var(--input-text); border: 1px solid var(--input-border); padding: 8px 12px; border-radius: 4px;">
                    </div>

                    <!-- Search Button -->
                    <div class="filter-group" style="display: flex; flex-direction: column;">
                        <button id="btn-apply-filter" class="btn-filter" style="background-color: #5442f5; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 24px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                            <span style="font-size: 14px;">🔍</span> Search / Filter
                        </button>
                    </div>

                    <!-- Signature Upload & Preview Section -->
                    <div class="filter-group" style="display: flex; align-items: center; gap: 10px; margin-left: auto;">
                        <div id="signature-preview-container" style="width: 40px; height: 40px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; border-radius: 4px; overflow: hidden; background: #fafafa;">
                            <span style="font-size: 10px; color: #888; text-align: center;">No Sign</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <label for="signature-file-input" style="font-size: 12px; display: block;">Signature Image</label>
                            <input type="file" id="signature-file-input" accept="image/*" style="font-size: 11px; max-width: 180px;">
                        </div>
                    </div>

                </div>

                <div class="table-wrapper">
                    <table class="report-table" id="report-table" style="font-size: 12px; width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left;">
                                <th style="padding: 10px;">ID</th>
                                <th style="padding: 10px;">Filled Date</th>                              
                                <th style="padding: 10px;">Itineraries</th>
                                <th style="padding: 10px;">Boat ID</th>
                                <th style="padding: 10px;">Department</th>                              
                                <th style="padding: 10px;">Issued Date</th>
                                <th style="padding: 10px; text-align: right;">Liters</th>
                                <th style="padding: 10px; text-align: right;">Total Amount</th>
                                <th style="padding: 10px;">Marks</th>
                            </tr>
                        </thead>
                        <tbody id="report-tbody">
                            <tr>
                                <td colspan="9" style="text-align: left; padding: 40px; color: #888; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                                    ကျေးဇူးပြု၍ အထက်ပါ Filter များ (သို့) ရှာဖွေလိုသော အချက်အလက်များကို ရွေးချယ်ပြီး <b>Search / Filter</b> ကို နှိပ်ပါ။
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    initReportEvents();
}

let cachedAllData = []; 
let cachedSignatureBase64 = ""; 

async function initReportEvents() {
    loadDepartmentsDropdown();

    const previewContainer = document.getElementById('signature-preview-container');

    // 🌟 ၁။ Refresh လုပ်လိုက်တိုင်း Sheet ထဲမှ Signature ကို API ဖြင့် သွားခေါ်မည်
    try {
        previewContainer.innerHTML = `<span style="font-size: 10px; color: #888; text-align: center;">Loading...</span>`;

        const savedSignature = await fetchSignature();
        const displaySrc = savedSignature.base64 || savedSignature.url;

        if (displaySrc) {
            cachedSignatureBase64 = savedSignature.base64 || "";
            previewContainer.innerHTML = `<img src="${displaySrc}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            previewContainer.innerHTML = `<span style="font-size: 10px; color: #888; text-align: center;">No Sign</span>`;
        }
    } catch (error) {
        console.error("Failed to load signature:", error);
        previewContainer.innerHTML = `<span style="font-size: 10px; color: red; text-align: center;">Error</span>`;
    }

    try {
        cachedAllData = await fetchTransactionsFromSheet();
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
    }

    document.getElementById('btn-apply-filter').addEventListener('click', () => {
        applyFiltersAndRender();
    });

    // 🌟 ၂။ Signature Image အသစ်ရွေးလိုက်တိုင်း သိမ်းဆည်းမည့် အပိုင်း
    const sigInput = document.getElementById('signature-file-input');
    if (sigInput) {
        sigInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 50000) {
                alert("ပုံအရွယ်အစားကြီးလွန်းပါသည်။ (50KB အောက်သာ ထည့်ပါ)");
                return;
            }

            const reader = new FileReader();
            reader.onload = async function(uploadEvent) {
                cachedSignatureBase64 = uploadEvent.target.result;
                
                previewContainer.innerHTML = `<img src="${cachedSignatureBase64}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5;">`;
                
                try {
                    const result = await saveSignature(cachedSignatureBase64);
                    
                    if (result && result.status === 'success') {
                        const finalSrc = result.url || cachedSignatureBase64;
                        previewContainer.innerHTML = `<img src="${finalSrc}" style="width: 100%; height: 100%; object-fit: cover;">`;
                        alert("Signature သိမ်းဆည်းခြင်း အောင်မြင်ပါသည်။");
                    } else {
                        console.error("Server Error:", result);
                        alert("Server မှ URL ပြန်လည်မရရှိပါ။");
                        previewContainer.innerHTML = `<img src="${cachedSignatureBase64}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    }
                } catch (err) {
                    console.error("Failed to save signature to sheet:", err);
                    alert("Signature သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိပါသည်။");
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // 🌟 ၃။ Excel Export (exceljs ကို အသုံးပြုခြင်း - Pyidaungsu ဖောင့်သတ်မှတ်ချက်ဖြင့်)
    document.getElementById('btn-export-excel').addEventListener('click', async () => {
        try {
            let currentFilteredData = [];
            const selectedDept = document.getElementById('filter-dept').value;
            const selectedMonth = document.getElementById('filter-month').value; 
            const startDateVal = document.getElementById('filter-start').value;
            const endDateVal = document.getElementById('filter-end').value;
            const boatQuery = document.getElementById('filter-boat').value.trim().toLowerCase();

            currentFilteredData = cachedAllData.filter(row => {
                if (selectedDept && row.department !== selectedDept) return false;
                if (boatQuery && !(row.boatId || '').toLowerCase().includes(boatQuery)) return false;

                const rowDateStr = row.filledDate ? row.filledDate.trim() : '';
                const rowDate = rowDateStr ? new Date(rowDateStr) : null;

                if (selectedMonth && rowDateStr) {
                    const [year, month] = selectedMonth.split('-');
                    const rYear = rowDate.getFullYear().toString();
                    const rMonth = String(rowDate.getMonth() + 1).padStart(2, '0');
                    if (rYear !== year || rMonth !== month) return false;
                }
                if (startDateVal && rowDate) {
                    const startD = new Date(startDateVal);
                    startD.setHours(0, 0, 0, 0);
                    if (rowDate < startD) return false;
                }
                if (endDateVal && rowDate) {
                    const endD = new Date(endDateVal);
                    endD.setHours(23, 59, 59, 999);
                    if (rowDate > endD) return false;
                }
                return true;
            });

            if (currentFilteredData.length === 0) {
                alert("Export ထုတ်ရန် Data မရှိပါ။");
                return;
            }

            const groupedByDept = {};
            currentFilteredData.forEach(item => {
                const dept = item.department || 'General';
                if (!groupedByDept[dept]) groupedByDept[dept] = [];
                groupedByDept[dept].push(item);
            });

            let monthYearStr = "";
            if (selectedMonth) {
                const [y, m] = selectedMonth.split('-');
                const dateObj = new Date(y, m - 1, 1);
                monthYearStr = dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' });
            } else {
                monthYearStr = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
            }

            // ---------------------------------------------------------
            const workbook = new ExcelJS.Workbook();

            // 🌟 ၁။ Summary Sheet အသစ်ဖန်တီးခြင်း 🌟
            const summarySheet = workbook.addWorksheet(`Summary (${monthYearStr})`); 

            // Summary Sheet အတွက် Column အကျယ်များ သတ်မှတ်ခြင်း
            summarySheet.columns = [
                { width: 10 },  // Sr.NO
                { width: 30 },  // Departments
                { width: 18 },  // Total Liter
                { width: 22 },  // Total Amount
                { width: 20 }   // Marks
            ];

            // Summary Sheet ခေါင်းစဉ်
            summarySheet.mergeCells(1, 1, 1, 5);
            const sumTitleCell = summarySheet.getCell(1, 1);
            sumTitleCell.value = `Monthly Summary - ${monthYearStr}`;
            sumTitleCell.font = { name: "Pyidaungsu", size: 14, bold: true, color: { argb: "1F4E78" } };
            sumTitleCell.alignment = { vertical: "middle", horizontal: "center" };

            // Summary Sheet ဇယားခေါင်းစဉ်များ
            const sumHeaders = ["Sr.NO", "Departments", "Total Liter", "Total Amount", "Marks"];
            const sumHeaderRow = summarySheet.addRow(sumHeaders);
            sumHeaderRow.font = { name: "Pyidaungsu", size: 11, bold: true, color: { argb: "FFFFFF" } };
            sumHeaderRow.alignment = { vertical: "middle", horizontal: "center" };
            sumHeaderRow.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } };
                cell.border = { top: {style:'thin', color:{argb:'D3D3D3'}}, bottom: {style:'thin', color:{argb:'D3D3D3'}}, left: {style:'thin', color:{argb:'D3D3D3'}}, right: {style:'thin', color:{argb:'D3D3D3'}} };
            });

            let srNo = 1;
            let sumGrandTotalLiters = 0;
            let sumGrandTotalAmount = 0;

            for (const [dept, rows] of Object.entries(groupedByDept)) {
                let deptTotalLiters = 0;
                let deptTotalAmount = 0;

                rows.forEach(row => {
                    deptTotalLiters += Number(row.liter || 0);
                    deptTotalAmount += Number(row.totalAmount || 0);
                });

                sumGrandTotalLiters += deptTotalLiters;
                sumGrandTotalAmount += deptTotalAmount;

                const summaryDataRow = summarySheet.addRow([
                    srNo, 
                    dept, 
                    deptTotalLiters, 
                    deptTotalAmount, 
                    "" 
                ]);

                summaryDataRow.font = { name: "Pyidaungsu", size: 11 };
                summaryDataRow.eachCell((cell, colNumber) => {
                    cell.border = { top: {style:'thin', color:{argb:'D3D3D3'}}, bottom: {style:'thin', color:{argb:'D3D3D3'}}, left: {style:'thin', color:{argb:'D3D3D3'}}, right: {style:'thin', color:{argb:'D3D3D3'}} };
                    
                    if (colNumber === 3 || colNumber === 4) {
                        cell.alignment = { vertical: 'middle', horizontal: 'right' };
                        cell.numFmt = '#,##0.00'; 
                    } else if (colNumber === 1 || colNumber === 5) {
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    } else {
                        cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    }
                });
                srNo++;
            }

            // Summary Sheet အတွက် Grand Total အောက်ဆုံးလိုင်း
            const sumTotalRowData = ["", "Grand Total", sumGrandTotalLiters, sumGrandTotalAmount, ""];
            const sumTotalRow = summarySheet.addRow(sumTotalRowData);
            sumTotalRow.font = { name: "Pyidaungsu", size: 12, bold: true };
            sumTotalRow.eachCell((cell, colNumber) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
                cell.border = { top: {style:'thin', color:{argb:'D3D3D3'}}, bottom: {style:'thin', color:{argb:'D3D3D3'}}, left: {style:'thin', color:{argb:'D3D3D3'}}, right: {style:'thin', color:{argb:'D3D3D3'}} };
                if (colNumber === 3 || colNumber === 4) {
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    cell.numFmt = '#,##0.00'; 
                } else if (colNumber === 2) {
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                }
            });

            // 🌟 SUMMARY SHEET အောက်တွင် SIGNATURE ထည့်သွင်းခြင်း 🌟
            let sumSignatureRowIndex = summarySheet.rowCount + 3;
            summarySheet.getRow(sumSignatureRowIndex).height = 40;

            if (cachedSignatureBase64) {
                const sumImageId = workbook.addImage({
                    base64: cachedSignatureBase64,
                    extension: 'png',
                });
                
                summarySheet.addImage(sumImageId, {
                    tl: { col: 3.9, row: sumSignatureRowIndex - 1 }, // Total Amount အောက်တွင်ပေါ်စေရန်
                    ext: { width: 80, height: 80 }           
                });
            }

            sumSignatureRowIndex += 2; 

            const sumPreparedCell = summarySheet.getCell(sumSignatureRowIndex, 4);
            sumPreparedCell.value = "Prepared by";
            sumPreparedCell.font = { name: "Pyidaungsu", size: 10, bold: true, color: { argb: "FF0000" } };
            sumPreparedCell.alignment = { vertical: 'middle', horizontal: 'center' };
            sumSignatureRowIndex++;

            const sumNameCell = summarySheet.getCell(sumSignatureRowIndex, 4);
            sumNameCell.value = "Nay Lin Htike";
            sumNameCell.font = { name: "Pyidaungsu", size: 11, bold: true, color: { argb: "0000FF" } };
            sumNameCell.alignment = { vertical: 'middle', horizontal: 'center' };
            
            // 🌟 ၂။ မူလရှိပြီးသား Department အသေးစိတ်များ (Reports) Sheet များကို Loop ဖြင့် ဖန်တီးခြင်း 🌟
            for (const [dept, rows] of Object.entries(groupedByDept)) {
                // Loop အတွင်းတွင် worksheet ကို Department အလိုက် သီးသန့်ဆောက်လုပ်ခြင်း
                const worksheet = workbook.addWorksheet(`Fuel - ${dept} (${monthYearStr}) Report`);

                worksheet.columns = [
                    { width: 22 }, { width: 14 }, { width: 55 }, 
                    { width: 10 }, { width: 28 }, { width: 14 }, 
                    { width: 10 }, { width: 20 }, { width: 20 }
                ];

                let currentRowIndex = 1;

                // ခေါင်းစဉ် (Title)
                worksheet.mergeCells(currentRowIndex, 1, currentRowIndex, 9);
                const titleCell = worksheet.getCell(currentRowIndex, 1);
                titleCell.value = `My Margui Fuel Issued for ${dept} - ${monthYearStr}`;
                titleCell.font = { name: "Pyidaungsu", size: 13, bold: true, color: { argb: "1F4E78" } };
                titleCell.alignment = { vertical: "middle", horizontal: "center" };
                currentRowIndex++;

                // Table Headers
                const headers = ["ID", "Filled Date", "Itineraries", "Boat ID", "Department", "Issued Date", "Liters", "Total Amount", "Marks"];
                const headerRow = worksheet.addRow(headers);
                headerRow.font = { name: "Pyidaungsu", size: 11, bold: true, color: { argb: "FFFFFF" } };
                headerRow.alignment = { vertical: "middle", horizontal: "center" };
                headerRow.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } };
                    cell.border = { top: {style:'thin', color:{argb:'D3D3D3'}}, bottom: {style:'thin', color:{argb:'D3D3D3'}}, left: {style:'thin', color:{argb:'D3D3D3'}}, right: {style:'thin', color:{argb:'D3D3D3'}} };
                });
                currentRowIndex++;

                // Data Rows
                let deptTotalLiters = 0;
                let deptTotalAmount = 0;

                rows.forEach(row => {
                    const liters = Number(row.liter || 0);
                    const amount = Number(row.totalAmount || 0);
                    deptTotalLiters += liters;
                    deptTotalAmount += amount;

                    const dataRow = worksheet.addRow([
                        row.id || '-',
                        row.filledDate || '-',
                        row.itineraries || '-',
                        row.boatId || '-',
                        row.department || '-',
                        row.issuedDate || '-',
                        liters,
                        amount,
                        row.marks || '-'
                    ]);

                    dataRow.font = { name: "Pyidaungsu", size: 11 };
                    
                    [2, 6].forEach(colIdx => {
                        const cell = dataRow.getCell(colIdx);
                        if (cell.value && cell.value !== '-') {
                            const d = new Date(cell.value);
                            if (!isNaN(d.getTime())) {
                                cell.value = d;
                                cell.numFmt = 'dd/mmm/yyyy';
                            }
                        }
                    });
                    dataRow.eachCell((cell, colNumber) => {
                        cell.border = { top: {style:'thin', color:{argb:'D3D3D3'}}, bottom: {style:'thin', color:{argb:'D3D3D3'}}, left: {style:'thin', color:{argb:'D3D3D3'}}, right: {style:'thin', color:{argb:'D3D3D3'}} };
                        if (colNumber === 7 || colNumber === 8) {
                            cell.alignment = { vertical: 'middle', horizontal: 'right' };
                        } else {
                            cell.alignment = { vertical: 'middle', horizontal: 'left' };
                        }
                        if (colNumber === 3) {
                            cell.alignment.wrapText = true; 
                        }
                    });
                    currentRowIndex++;
                });

                // Grand Total Row
                const totalRowData = ["Grand Total", "", "", "", "", "", deptTotalLiters, deptTotalAmount, ""];
                const totalRow = worksheet.addRow(totalRowData);
                totalRow.font = { name: "Pyidaungsu", size: 11, bold: true };
                totalRow.eachCell((cell, colNumber) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
                    cell.border = { top: {style:'thin', color:{argb:'D3D3D3'}}, bottom: {style:'thin', color:{argb:'D3D3D3'}}, left: {style:'thin', color:{argb:'D3D3D3'}}, right: {style:'thin', color:{argb:'D3D3D3'}} };
                    if (colNumber === 7 || colNumber === 8) {
                        cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    }
                });
                currentRowIndex++;

                // Signature placement
                currentRowIndex += 2; 

                const signatureRowIndex = currentRowIndex;
                worksheet.getRow(signatureRowIndex).height = 40;

                if (cachedSignatureBase64) {
                    const imageId = workbook.addImage({
                        base64: cachedSignatureBase64,
                        extension: 'png',
                    });
                    
                    worksheet.addImage(imageId, {
                        tl: { col: 7.9, row: signatureRowIndex - 1 }, 
                        ext: { width: 80, height: 80 }           
                    });
                }

                currentRowIndex += 2; 

                const preparedCell = worksheet.getCell(currentRowIndex, 8);
                preparedCell.value = "Prepared by";
                preparedCell.font = { name: "Pyidaungsu", size: 10, bold: true, color: { argb: "FF0000" } };
                preparedCell.alignment = { vertical: 'middle', horizontal: 'center' };
                currentRowIndex++;

                const nameCell = worksheet.getCell(currentRowIndex, 8);
                nameCell.value = "Nay Lin Htike";
                nameCell.font = { name: "Pyidaungsu", size: 11, bold: true, color: { argb: "0000FF" } };
                nameCell.alignment = { vertical: 'middle', horizontal: 'center' };
            }

            // လနှင့်နှစ်ကို "mmm, yyyy" ပုံစံဖန်တီးခြင်း (ဥပမာ - Aug, 2026)
            let fileMonthYearStr = "";
            if (selectedMonth) {
                const [y, m] = selectedMonth.split('-');
                const dateObj = new Date(y, m - 1, 1);
                fileMonthYearStr = dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '_');
            } else {
                fileMonthYearStr = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '_');
            }

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            
            const anchor = document.createElement('a'); 
            anchor.href = url;
            // ဖိုင်အမည်တွင် Month နှင့် Year ထည့်သွင်းခြင်း
            anchor.download = `Fuel_Department_Report_${fileMonthYearStr}.xlsx`;
            document.body.appendChild(anchor); 
            anchor.click();
            document.body.removeChild(anchor); 
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Excel Export Error:", error);
            alert("Excel Export လုပ်ရာတွင် အမှားအယွင်း ရှိနေပါသည်။");
        }
    });

    // 🌟 ၄။ PDF Export (Pyidaungsu ဖောင့်သတ်မှတ်ချက်ဖြင့်)
    document.getElementById('btn-export-pdf').addEventListener('click', async () => {
        try {
            let currentFilteredData = [];
            const selectedDept = document.getElementById('filter-dept').value;
            const selectedMonth = document.getElementById('filter-month').value; 
            const startDateVal = document.getElementById('filter-start').value;
            const endDateVal = document.getElementById('filter-end').value;
            const boatQuery = document.getElementById('filter-boat').value.trim().toLowerCase();

            currentFilteredData = cachedAllData.filter(row => {
                if (selectedDept && row.department !== selectedDept) return false;
                if (boatQuery && !(row.boatId || '').toLowerCase().includes(boatQuery)) return false;

                const rowDateStr = row.filledDate ? row.filledDate.trim() : '';
                const rowDate = rowDateStr ? new Date(rowDateStr) : null;

                if (selectedMonth && rowDateStr) {
                    const [year, month] = selectedMonth.split('-');
                    const rYear = rowDate.getFullYear().toString();
                    const rMonth = String(rowDate.getMonth() + 1).padStart(2, '0');
                    if (rYear !== year || rMonth !== month) return false;
                }
                if (startDateVal && rowDate) {
                    const startD = new Date(startDateVal);
                    startD.setHours(0, 0, 0, 0);
                    if (rowDate < startD) return false;
                }
                if (endDateVal && rowDate) {
                    const endD = new Date(endDateVal);
                    endD.setHours(23, 59, 59, 999);
                    if (rowDate > endD) return false;
                }
                return true;
            });

            if (currentFilteredData.length === 0) {
                alert("Export ထုတ်ရန် Data မရှိပါ။");
                return;
            }

            const groupedByDept = {};
            currentFilteredData.forEach(item => {
                const dept = item.department || 'General';
                if (!groupedByDept[dept]) groupedByDept[dept] = [];
                groupedByDept[dept].push(item);
            });

            let monthYearStr = "";
            if (selectedMonth) {
                const [y, m] = selectedMonth.split('-');
                const dateObj = new Date(y, m - 1, 1);
                monthYearStr = dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' });
            } else {
                monthYearStr = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
            }

            let finalHtmlString = `
    <div style="padding: 20px; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif; color: #000000; background: #ffffff; width: 1120px;">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Pyidaungsu&display=swap');
            td, th, h2 {
                font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif !important;
                font-feature-settings: "liga" 1, "kern" 1, "ccmp" 1 !important;
                text-rendering: optimizeLegibility !important;
                -webkit-font-smoothing: antialiased;
            }
        </style>
`;

            // 🌟 PDF တွင် Summary စာမျက်နှာအသစ်နှင့် Signature ထည့်သွင်းခြင်း 🌟
            let sumGrandTotalLitersPDF = 0;
            let sumGrandTotalAmountPDF = 0;
            let summaryTableRows = "";
            let sumSrNo = 1;

            for (const [dept, rows] of Object.entries(groupedByDept)) {
                let deptLiters = 0;
                let deptAmount = 0;
                rows.forEach(row => {
                    deptLiters += Number(row.liter || 0);
                    deptAmount += Number(row.totalAmount || 0);
                });
                sumGrandTotalLitersPDF += deptLiters;
                sumGrandTotalAmountPDF += deptAmount;

                summaryTableRows += `
                    <tr style="color: #000000; font-weight: normal; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                        <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: center; font-size: 11px;">${sumSrNo++}</td>
                        <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: left; font-size: 11px;">${dept}</td>
                        <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: right; font-size: 11px;">${deptLiters.toLocaleString()}</td>
                        <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: right; font-size: 11px;">${deptAmount.toLocaleString()}</td>
                        <td style="border: 1px solid #D3D3D3; padding: 6px; font-size: 11px;"></td>
                    </tr>
                `;
            }

            const summarySignatureHtml = cachedSignatureBase64 
                ? `<img src="${cachedSignatureBase64}" style="width: 70px; height: 70px; object-fit: contain; display: block; margin: 0 auto 5px auto;" crossorigin="anonymous">` 
                : `<div style="height: 70px; width: 70px; margin: 0 auto 5px auto;"></div>`;

            finalHtmlString += `
                <div style="page-break-after: always; margin-bottom: 40px; background: #ffffff;">
                    <h2 style="text-align: center; color: #1F4E78; font-size: 16px; font-weight: bold; margin-bottom: 20px; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                        Monthly Summary - ${monthYearStr}
                    </h2>
                    
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 5px; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                        <thead>
                            <tr style="background-color: #1F4E78; color: #ffffff; font-weight: bold;">
                                <th style="border: 1px solid #D3D3D3; padding: 6px; width: 10%; text-align: center;">Sr.NO</th>
                                <th style="border: 1px solid #D3D3D3; padding: 6px; width: 40%; text-align: center;">Departments</th>
                                <th style="border: 1px solid #D3D3D3; padding: 6px; width: 15%; text-align: center;">Total Liter</th>
                                <th style="border: 1px solid #D3D3D3; padding: 6px; width: 20%; text-align: center;">Total Amount</th>
                                <th style="border: 1px solid #D3D3D3; padding: 6px; width: 15%; text-align: center;">Marks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summaryTableRows}
                            <tr style="background-color: #F2F2F2; font-weight: bold; font-size: 12px; color: #000000;">
                                <td colspan="2" style="border: 1px solid #D3D3D3; padding: 6px; text-align: right;">Grand Total</td>
                                <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: right;">${sumGrandTotalLitersPDF.toLocaleString()}</td>
                                <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: right;">${sumGrandTotalAmountPDF.toLocaleString()}</td>
                                <td style="border: 1px solid #D3D3D3; padding: 6px;"></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 25px; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                        <tr>
                            <td style="width: 73%;"></td>
                            <td style="width: 15%; text-align: center;">
                                ${summarySignatureHtml}
                                <div style="color: red; font-size: 10px; font-weight: bold; margin-bottom: 2px;">Prepared by</div>
                                <div style="color: blue; font-size: 12px; font-weight: bold;">Nay Lin Htike</div>
                            </td>
                            <td style="width: 12%;"></td>
                        </tr>
                    </table>
                </div>
            `;

            // မူလရှိပြီးသား Department Reports များ
            for (const [dept, rows] of Object.entries(groupedByDept)) {
                let deptTotalLiters = 0;
                let deptTotalAmount = 0;

                finalHtmlString += `
                    <div style="page-break-after: always; margin-bottom: 40px; background: #ffffff;">
                        <!-- ခေါင်းစဉ် (Bold ပြုလုပ်ထားသည်) -->
                        <h2 style="text-align: center; color: #1F4E78; font-size: 16px; font-weight: bold; margin-bottom: 20px; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                            My Margui Fuel Issued for ${dept} - ${monthYearStr}
                        </h2>
                        
                        <!-- ဇယား (Table ၏ စာသားများမှာ font-weight: normal ဖြစ်၍ သေးငယ်ပြီး ပုံမှန်အတိုင်း ပေါ်မည်) -->
                        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 5px; table-layout: fixed; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                            <thead>
                                <!-- ဇယားခေါင်းစဉ် (Table Headers - Bold ဖြစ်မည်) -->
                                <tr style="background-color: #1F4E78; color: #ffffff; font-weight: bold;">
                                    <th style="border: 1px solid #D3D3D3; padding: 6px; width: 13%; text-align: center;">ID</th>
                                    <th style="border: 1px solid #D3D3D3; padding: 6px; width: 9%; text-align: center;">Filled Date</th>
                                    <th style="border: 1px solid #D3D3D3; padding: 6px; width: 25%; text-align: center;">Itineraries</th>
                                    <th style="border: 1px solid #D3D3D3; padding: 6px; width: 6%; text-align: center;">Boat ID</th>
                                    <th style="border: 1px solid #D3D3D3; padding: 6px; width: 12%; text-align: center;">Department</th>
                                    <th style="border: 1px solid #D3D3D3; padding: 6px; width: 9%; text-align: center;">Issued Date</th>
                                    <th style="border: 1px solid #D3D3D3; padding: 6px; width: 6%; text-align: center;">Liters</th>
                                    <th style="border: 1px solid #D3D3D3; padding: 6px; width: 10%; text-align: center;">Total Amount</th>
                                    <th style="border: 1px solid #D3D3D3; padding: 6px; width: 11%; text-align: center;">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                rows.forEach(row => {
                    const liters = Number(row.liter || 0);
                    const amount = Number(row.totalAmount || 0);
                    deptTotalLiters += liters;
                    deptTotalAmount += amount;

                    const formatDate = (dateStr) => {
                        if (!dateStr || dateStr === '-') return '-';
                        const d = new Date(dateStr);
                        return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    };

                    finalHtmlString += `
                                <tr style="color: #000000; font-weight: normal; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; color: #000000; text-align: left; font-weight: normal;font-size: 11px;">${row.id || '-'}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; color: #000000; text-align: center; font-weight: normal;font-size: 11px;">${formatDate(row.filledDate)}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; color: #000000; text-align: left; word-wrap: break-word; word-break: break-word; white-space: normal; font-weight: normal;font-size: 11px; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif; font-feature-settings: 'liga' 1, 'kern' 1, 'ccmp' 1; text-rendering: optimizeLegibility; line-height: 1.5;">${row.itineraries || '-'}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; color: #000000; text-align: center; font-weight: normal;font-size: 11px;">${row.boatId || '-'}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; color: #000000; text-align: left; font-weight: normal;font-size: 11px;">${row.department || '-'}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; color: #000000; text-align: center; font-weight: normal;font-size: 11px;">${formatDate(row.issuedDate)}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: right; color: #000000; font-weight: normal;font-size: 11px;">${liters.toLocaleString()}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: right; color: #000000; font-weight: normal;font-size: 11px;">${amount.toLocaleString()}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; color: #000000; text-align: center; font-weight: normal;font-size: 11px;">${row.marks || '-'}</td>
                                </tr>
                    `;
                });

                const signatureHtml = cachedSignatureBase64 
                    ? `<img src="${cachedSignatureBase64}" style="width: 70px; height: 70px; object-fit: contain; display: block; margin: 0 auto 5px auto;" crossorigin="anonymous">` 
                    : `<div style="height: 70px; width: 70px; margin: 0 auto 5px auto;"></div>`;

                finalHtmlString += `
                                <!-- Grand Total -->
                                <tr style="background-color: #F2F2F2; font-weight: bold;font-size: 12px; color: #000000; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                                    <td colspan="6" style="border: 1px solid #D3D3D3; padding: 6px; text-align: right; color: #000000; font-weight: bold;">Grand Total</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: right; color: #000000; font-weight: bold;">${deptTotalLiters.toLocaleString()}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; text-align: right; color: #000000; font-weight: bold;">${deptTotalAmount.toLocaleString()}</td>
                                    <td style="border: 1px solid #D3D3D3; padding: 6px; color: #000000;"></td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <!-- လက်မှတ်ထိုးရာနေရာ -->
                        <table style="width: 100%; border-collapse: collapse; margin-top: 25px; font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;">
                            <tr>
                                <td style="width: 73%;"></td>
                                <td style="width: 10%; text-align: center;">
                                    ${signatureHtml}
                                    <div style="color: red; font-size: 10px; font-weight: bold; margin-bottom: 2px;">Prepared by</div>
                                    <div style="color: blue; font-size: 12px; font-weight: bold;">Nay Lin Htike</div>
                                </td>
                                <td style="width: 17%;"></td>
                            </tr>
                        </table>
                    </div>
                `;
            }

            finalHtmlString += `</div>`;

            const btn = document.getElementById('btn-export-pdf');
            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ Generating PDF...';

            const opt = {
                margin:       2,
                filename:     'Fuel_Department_Report.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };

            html2pdf().set(opt).from(finalHtmlString).save().then(() => {
                btn.innerHTML = originalText;
            }).catch(err => {
                console.error("html2pdf error:", err);
                alert("PDF ထုတ်ယူရာတွင် အမှားအယွင်း ဖြစ်ပေါ်သွားပါသည်။");
                btn.innerHTML = originalText;
            });

        } catch (error) {
            console.error("PDF Export Error:", error);
            alert("PDF Export လုပ်ရာတွင် အမှားအယွင်း ရှိနေပါသည်။");
        }
    });
}