// js/fuel.js
import { fetchTransactionsFromSheet } from './api.js';


const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYvzFOpcsTNxeGGrS6lJ1jG23-7p4Gqz4olWD1WLM7xvK1tdR4dZ9JomnxBRZ-UPep/exec'; 
// Base64 ကို File Object အဖြစ် အချိန်မဆိုင်းဘဲ ချက်ချင်းပြောင်းပေးမည့် Function
    function dataURLtoFile(dataurl, filename) {
        if (!dataurl) return null;
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }
export function renderFuelForm(container) {
    container.innerHTML = `
        <div class="module-wrapper">
            <h2 style="margin-bottom: 10px;">💧 Add New Fuel Entry</h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">Record boat refueling details and calculate vouchers.</p>
            
            <div class="glass-panel form-container">
                <form id="fuel-form">
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="entry-id">ID</label>
                            <!-- ID ကို Loading ပြထားပြီး API က Data ရမှ အစဉ်လိုက် နံပါတ်ချပေးပါမည် -->
                            <input type="text" id="entry-id" class="form-control readonly-field" value="Loading..." readonly>
                        </div>
                        <div class="form-group">
                            <label for="filled-date">Filled Date *</label>
                            <input type="datetime-local" id="filled-date" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="itineraries">Itineraries (ခရီးစဉ်)</label>
                            <input type="text" id="itineraries" class="form-control" placeholder="e.g. YGN to MDY">
                        </div>   
                    </div>
                    <hr style="border-color: rgba(150,150,150,0.2); margin: 20px 0;">
                    
                    <div class="form-grid">
                        <!-- Boat ID Dropdown နှင့် Manage ခလုတ်များ -->
                        <div class="form-group">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <label for="boat-id" style="margin: 0;">Boat ID *</label>
                                <div>
                                    <button type="button" id="btn-add-boat" style="background: none; border: none; color: #2563eb; cursor: pointer; font-size: 11px; margin-right: 5px;">+ Add</button>
                                    <button type="button" id="btn-manage-boat" style="background: none; border: none; color: #d97706; cursor: pointer; font-size: 11px;">⚙️ Manage</button>
                                </div>
                            </div>
                            <select id="boat-id" class="form-control" required>
                                <option value="">Select Boat</option>
                            </select> 
                        </div>
                        <!-- Department Dropdown နှင့် Manage ခလုတ်များ -->
                        <div class="form-group">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <label for="department" style="margin: 0;">Department *</label>
                                <div>
                                    <button type="button" id="btn-add-dept" style="background: none; border: none; color: #2563eb; cursor: pointer; font-size: 11px; margin-right: 5px;">+ Add</button>
                                    <button type="button" id="btn-manage-dept" style="background: none; border: none; color: #d97706; cursor: pointer; font-size: 11px;">⚙️ Manage</button>
                                </div>
                            </div>
                            <select id="department" class="form-control" required>
                                <option value="">Select Department</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="issued-date">Issued Date *</label>
                            <input type="datetime-local" id="issued-date" class="form-control" required>
                        </div> 
                    </div>                      
                    <hr style="border-color: rgba(150,150,150,0.2); margin: 20px 0;">

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="price-drum">Price / Drum *</label>
                            <input type="number" id="price-drum" class="form-control" placeholder="0" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="liter">Liter *</label>
                            <input type="number" id="liter" class="form-control" placeholder="0.00" step="0.01" min="0.1" required>
                        </div>
                        <div class="form-group">
                            <label for="price-liter">Price / Liter (Auto: Drum/220)</label>
                            <input type="number" id="price-liter" class="form-control readonly-field" placeholder="0.00" readonly>
                        </div>
                    </div>

                    <hr style="border-color: rgba(150,150,150,0.2); margin: 20px 0;">

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="total-amount">Total Amount</label>
                            <input type="text" id="total-amount" class="form-control readonly-field" placeholder="0" readonly>
                        </div>
                        <div class="form-group">
                            <label for="marks">Marks (အစွန်းထွက်)</label>
                            <input type="text" id="marks" class="form-control readonly-field" placeholder="Variance" readonly>
                        </div>

                        <div class="form-group">
                            <label for="photo">Photo (Voucher/Proof)</label>
                            <input type="file" id="photo" class="form-control" accept="image/*">
                            
                            <div id="photo-preview-container" style="display: none; margin-top: 15px; text-align: center; padding: 10px; border: 1px dashed rgba(150, 150, 150, 0.3); border-radius: 8px; background: rgba(150, 150, 150, 0.05);">
                                <img id="photo-preview" src="" alt="Voucher Thumbnail" style="max-width: 100%; max-height: 150px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="voc-amount">Voc Amount (ဘောက်ချာပါ ငွေကျပ်)</label>
                            <input type="number" id="voc-amount" class="form-control" placeholder="0">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" id="btn-save-draft" class="btn-secondary" style="background: rgba(245, 158, 11, 0.1); color: #d97706;">Save as Draft</button>
                        <button type="button" id="btn-send-viber" class="btn-secondary" style="background: rgba(114, 47, 245, 0.1); color: #722ff5;">📤 Send to Viber</button>
                        <button type="reset" class="btn-secondary">Clear</button>
                        <button type="submit" class="btn-primary" style="padding: 12px 24px;">Save Entry</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const filledDateInput = document.getElementById('filled-date');
    const issuedDateInput = document.getElementById('issued-date');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const currentDateTime = now.toISOString().slice(0, 16);
    filledDateInput.value = currentDateTime;
    issuedDateInput.value = currentDateTime;

    const priceDrumInput = document.getElementById('price-drum');
    const priceLiterInput = document.getElementById('price-liter');
    const literInput = document.getElementById('liter');
    const vocAmountInput = document.getElementById('voc-amount');
    const totalAmountInput = document.getElementById('total-amount');
    const marksInput = document.getElementById('marks');

    let photoBase64 = null;
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreview = document.getElementById('photo-preview');

    document.getElementById('photo').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                photoBase64 = event.target.result;
                photoPreview.src = photoBase64;
                photoPreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            photoBase64 = null;
            photoPreview.src = '';
            photoPreviewContainer.style.display = 'none';
        }
    });

    const calculateValues = () => {
        const priceDrum = parseFloat(priceDrumInput.value) || 0;
        const priceLiter = priceDrum > 0 ? (priceDrum / 220) : 0;
        priceLiterInput.value = priceLiter > 0 ? priceLiter.toFixed(2) : '';

        const liter = parseFloat(literInput.value) || 0;
        const calculatedTotal = Math.round(liter * priceLiter);
        const vocAmountRaw = vocAmountInput.value;
        
        if (vocAmountRaw !== '') {
            const vocAmount = parseFloat(vocAmountRaw) || 0;
            totalAmountInput.value = vocAmount.toLocaleString();
            const variance = vocAmount - calculatedTotal;
            const sign = variance > 0 ? '+' : ''; 
            marksInput.value = `အစွန်းထွက် (${sign}${variance.toLocaleString()})`;;
            
            if (variance > 0) marksInput.style.color = '#10b981'; 
            else if (variance < 0) marksInput.style.color = '#ef4444'; 
            else marksInput.style.color = 'var(--text-primary)';
        } else {
            totalAmountInput.value = calculatedTotal > 0 ? calculatedTotal.toLocaleString() : '';
            marksInput.value = '';
            marksInput.style.color = 'var(--text-primary)';
        }
    };

    priceDrumInput.addEventListener('input', calculateValues);
    literInput.addEventListener('input', calculateValues);
    vocAmountInput.addEventListener('input', calculateValues);

    async function loadDropdowns() {
        try {
            const boatRes = await fetch(`${GOOGLE_APP_SCRIPT_URL}?action=boats`);
            const boats = await boatRes.json();
            const boatSelect = document.getElementById('boat-id');
            boatSelect.innerHTML = '<option value="">Select Boat</option>';
            boats.forEach(boat => {
                const opt = document.createElement('option');
                opt.value = boat;
                opt.textContent = boat;
                boatSelect.appendChild(opt);
            });

            const deptRes = await fetch(`${GOOGLE_APP_SCRIPT_URL}?action=departments`);
            const depts = await deptRes.json();
            const deptSelect = document.getElementById('department');
            deptSelect.innerHTML = '<option value="">Select Department</option>';
            depts.forEach(dept => {
                const opt = document.createElement('option');
                opt.value = dept;
                opt.textContent = dept;
                deptSelect.appendChild(opt);
            });
        } catch (err) {
            console.error("Failed to load dropdown lists", err);
        }
    }

    loadDropdowns();

    document.getElementById('btn-add-boat').addEventListener('click', async () => {
        const newBoat = prompt("Enter new Boat ID (e.g. BOAT-004):");
        if (newBoat && newBoat.trim() !== "") {
            try {
                await fetch(GOOGLE_APP_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'add_boat', data: { value: newBoat.trim() } })
                });
                alert("✅ Boat ID added successfully!");
                loadDropdowns();
            } catch (e) {
                alert("Failed to add boat.");
            }
        }
    });

    document.getElementById('btn-add-dept').addEventListener('click', async () => {
        const newDept = prompt("Enter new Department name:");
        if (newDept && newDept.trim() !== "") {
            try {
                await fetch(GOOGLE_APP_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'add_department', data: { value: newDept.trim() } })
                });
                alert("✅ Department added successfully!");
                loadDropdowns();
            } catch (e) {
                alert("Failed to add department.");
            }
        }
    });

    document.getElementById('btn-manage-boat').addEventListener('click', async () => {
        const target = prompt("Enter existing Boat ID to Edit or Delete:\n(Type 'DELETE:BoatName' to delete, or just 'NewName' to update)");
        if (!target) return;
        
        let actionType = 'edit_boat';
        let oldValue = prompt("Enter the OLD Boat ID you want to change/delete:");
        if (!oldValue) return;

        if (target.toUpperCase() === 'DELETE') {
            actionType = 'delete_boat';
        }

        try {
            await fetch(GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: actionType, data: { oldValue: oldValue, newValue: target } })
            });
            alert("✅ Boat list updated successfully!");
            loadDropdowns();
        } catch (e) {
            alert("Operation failed.");
        }
    });

    document.getElementById('btn-manage-dept').addEventListener('click', async () => {
        const target = prompt("Enter new Department name (to update) or type to manage:");
        if (!target) return;
        let oldValue = prompt("Enter the OLD Department name you want to change:");
        if (!oldValue) return;

        try {
            await fetch(GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'edit_department', data: { oldValue: oldValue, newValue: target } })
            });
            alert("✅ Department list updated successfully!");
            loadDropdowns();
        } catch (e) {
            alert("Operation failed.");
        }
    });


document.getElementById('btn-send-viber').addEventListener('click', async () => {
    const sendBtn = document.getElementById('btn-send-viber');
    const originalText = sendBtn.innerText;

    try {
        sendBtn.innerText = '⏳ Generating Card Image...';
        sendBtn.disabled = true;

        // ၁။ GS ထံမှ အချက်အလက်များ လှမ်းယူမည်
        const res = await fetch(`${GOOGLE_APP_SCRIPT_URL}?action=viber`);
        const data = await res.json();

        if (data.error) {
            alert("⚠️ " + data.error);
            return;
        }

        // ၂။ Card ထဲသို့ ဒေတာ ဖြည့်မည်
        document.getElementById('vc-id').innerText = data.id || '-';
        document.getElementById('vc-boat').innerText = data.boatId || '-';
        document.getElementById('vc-dept').innerText = data.department || '-';
        document.getElementById('vc-itineraries').innerText = data.itineraries || '-';
        document.getElementById('vc-liter').innerText = data.liter || '0 L';
        document.getElementById('vc-date').innerText = data.issuedDate || '-';

        // Base64 ပုံကို ဖြည့်ဆည်းမည်
        const photoBox = document.getElementById('vc-photo-box');
        const imgTag = document.getElementById('vc-img');

        if (data.photoBase64) {
            imgTag.src = data.photoBase64;
            photoBox.style.display = 'block';

            await new Promise((resolve) => {
                imgTag.onload = resolve;
                imgTag.onerror = resolve;
            });
        } else {
            photoBox.style.display = 'none';
        }

        // Font Ready ဖြစ်သည်အထိ စောင့်မည်
        if (document.fonts) {
            await document.fonts.ready;
        }

        const cardElement = document.getElementById('voucher-card');

        // 🌟 ၃။ htmlToImage ဖြင့် မြန်မာစာ အတိအကျ ပုံပြောင်းမည်
        const blob = await htmlToImage.toBlob(cardElement, {
            quality: 0.95,
            pixelRatio: 2,
            skipFonts: true // 👈 ဤနေရာတွင် ထည့်ပေးပါ
        });

        if (!blob) {
            throw new Error("Blob creation failed");
        }

        // ၄။ Clipboard ထဲ သို့ Copy ကူးမည်
        try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);

            alert("✅ Voucher Card ပုံကို Clipboard ထဲသို့ Copy ကူးပြီးပါပြီ!\n\nViber ပွင့်လာပါက Chat Box တွင် Paste (Ctrl + V) လုပ်၍ ပို့နိုင်ပါပြီ။");
            window.location.href = 'viber://';

        } catch (clipboardErr) {
            console.error("Clipboard Error:", clipboardErr);
            alert("⚠️ Image Copy လုပ်ရာတွင် အမှားအယွင်း ရှိနေပါသည်။");
        }

    } catch (error) {
        console.error("Error creating card image:", error);
        alert("⚠️ Voucher Card ပုံ ထုတ်ယူရာတွင် အမှားအယွင်း ရှိနေပါသည်။");
    } finally {
        sendBtn.innerText = originalText;
        sendBtn.disabled = false;
    }
});


    const editingSheetJson = localStorage.getItem('editing_sheet_data');
    let isEditingMode = false;

    if (editingSheetJson) {
        isEditingMode = true;
        const data = JSON.parse(editingSheetJson);
        
        const formatForInput = (dateStr) => {
            if (!dateStr) return '';
            try {
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return '';
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); 
                return d.toISOString().slice(0, 16);
            } catch(e) { return ''; }
        };

        setTimeout(() => {
            if(document.getElementById('entry-id')) document.getElementById('entry-id').value = data.id || '';
            if(document.getElementById('filled-date')) document.getElementById('filled-date').value = formatForInput(data.filledDate);
            if(document.getElementById('issued-date')) document.getElementById('issued-date').value = formatForInput(data.issuedDate);
            if(document.getElementById('itineraries')) document.getElementById('itineraries').value = data.itineraries || '';
            if(document.getElementById('boat-id')) document.getElementById('boat-id').value = data.boatId || '';
            if(document.getElementById('department')) document.getElementById('department').value = data.department || '';
            if(document.getElementById('price-drum')) document.getElementById('price-drum').value = data.priceDrum || '';
            if(document.getElementById('liter')) document.getElementById('liter').value = data.liter || '';
            if(document.getElementById('voc-amount')) document.getElementById('voc-amount').value = data.vocAmount !== null ? data.vocAmount : '';
            
            if(data.photo && data.photo !== "Photo Attached" && data.photo !== "No Photo") {
                photoBase64 = data.photo;
                photoPreview.src = data.photo;
                photoPreviewContainer.style.display = 'block';
            }
            
            priceDrumInput.dispatchEvent(new Event('input'));
            literInput.dispatchEvent(new Event('input'));
            if(data.vocAmount) vocAmountInput.dispatchEvent(new Event('input'));

            form.querySelector('button[type="submit"]').innerText = 'Update Entry';
        }, 200);
    }

    // 🌟 ID အစဉ်လိုက်ထုတ်ပေးမည့် Function 🌟
    async function generateSequentialID() {
        if (isEditingMode) return; // Edit လုပ်နေရင် မူလ ID ကိုသာ ဆက်သုံးမည်
        
        const dateVal = filledDateInput.value;
        let dObj = dateVal ? new Date(dateVal) : new Date();
        if (isNaN(dObj.getTime())) dObj = new Date();
        
        const yyyy = dObj.getFullYear();
        const mm = String(dObj.getMonth() + 1).padStart(2, '0');
        
        // ပုံစံသစ်အတွက် Prefix နှင့် Suffix သတ်မှတ်ခြင်း
        const prefix = `MMFA-`;
        const suffix = `/${mm}/${yyyy}`; 
        
        const idInput = document.getElementById('entry-id');
        idInput.value = 'Loading...';
        
        try {
            // Google Sheet ထဲမှ ဒေတာများကို ယူပြီး နောက်ဆုံးနံပါတ်ကို စစ်ဆေးခြင်း
            const data = await fetchTransactionsFromSheet();
            let maxSeq = 0;
            
            if (data && data.length > 0) {
                data.forEach(row => {
                    // လနှင့် နှစ် တူညီသော ID များကိုသာ စစ်ဆေးမည်
                    if (row.id && row.id.startsWith(prefix) && row.id.endsWith(suffix)) {
                        // ဥပမာ - MMFA-00001/07/2026 ကို '/' ဖြင့်ပိုင်းမည်
                        const prefixPart = row.id.split('/')[0]; // "MMFA-00001" ရမည်
                        const seqStr = prefixPart.replace(prefix, ''); // "00001" ရမည်
                        const seqNum = parseInt(seqStr, 10);
                        
                        if (!isNaN(seqNum) && seqNum > maxSeq) {
                            maxSeq = seqNum;
                        }
                    }
                });
            }
            
            const nextSeq = maxSeq + 1;
            // MMFA- + 00001 + /07/2026 ပုံစံဖြင့် ပေါင်းမည်
            idInput.value = prefix + String(nextSeq).padStart(5, '0') + suffix;
        } catch (error) {
            console.error("Failed to fetch data for ID generation:", error);
            // Error တက်ပါက MMFA-00000/07/2026 အဖြစ် သတ်မှတ်မည်
            idInput.value = prefix + '00000' + suffix; 
        }
    }

    // Form ပွင့်လာချိန်တွင် Edit Mode မဟုတ်ပါက ID အသစ်ထုတ်ပေးမည်
    if (!isEditingMode) {
        generateSequentialID();
    }

    // Filled Date ပြောင်းသွားပါက သက်ဆိုင်ရာ လပေါ်မူတည်ပြီး ID ပြန်လည်ပြောင်းလဲပေးမည်
    filledDateInput.addEventListener('change', () => {
        if (!isEditingMode) generateSequentialID();
    });

    const form = document.getElementById('fuel-form');

    // --- နေ့စွဲကို dd/mmm/yyyy ပုံစံပြောင်းမည့် Function ---
    function formatDate(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        const day = String(d.getDate()).padStart(2, '0');
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[d.getMonth()];
        const year = d.getFullYear();

        return `${day}/${month}/${year}`;
    }

form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = isEditingMode ? 'Updating...' : 'Saving...';
        submitBtn.disabled = true;

        const entryData = {
            id: document.getElementById('entry-id').value,
            filledDate: formatDate(filledDateInput.value),
            itineraries: document.getElementById('itineraries').value,
            boatId: document.getElementById('boat-id').value,
            department: document.getElementById('department').value,
            issuedDate: formatDate(issuedDateInput.value),
            priceDrum: parseFloat(priceDrumInput.value),
            liter: parseFloat(literInput.value),
            priceLiter: parseFloat(priceLiterInput.value),
            totalAmount: parseFloat(totalAmountInput.value.replace(/,/g, '')),
            marks: marksInput.value,
            photo: photoBase64,
            vocAmount: vocAmountInput.value ? parseFloat(vocAmountInput.value) : null,
            createdAt: isEditingMode ? JSON.parse(editingSheetJson).createdAt : new Date().toISOString()
        };

        try {
            if (GOOGLE_APP_SCRIPT_URL) {
                // Google Sheet သို့ Data ပို့ခြင်း
                await fetch(GOOGLE_APP_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: isEditingMode ? 'update' : 'create', 
                        data: entryData 
                    })
                });
            }

            alert(isEditingMode ? '✅ Entry updated successfully!' : '✅ Fuel entry saved successfully!');

            form.reset();
            localStorage.removeItem('editing_sheet_data');
            isEditingMode = false;
            submitBtn.innerText = 'Save Entry';
            submitBtn.disabled = false;
            
            const resetNow = new Date();
            resetNow.setMinutes(resetNow.getMinutes() - resetNow.getTimezoneOffset());
            const resetDateTime = resetNow.toISOString().slice(0, 16);
            filledDateInput.value = resetDateTime;
            issuedDateInput.value = resetDateTime;
            
            generateSequentialID();

        } catch (error) {
            console.error('Error saving:', error);
            alert('⚠️ Failed to connect to Google Sheet.');
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    form.addEventListener('reset', () => {
        localStorage.removeItem('editing_sheet_data');
        isEditingMode = false;
        form.querySelector('button[type="submit"]').innerText = 'Save Entry';
        photoBase64 = null;
        photoPreview.src = '';
        photoPreviewContainer.style.display = 'none';
        marksInput.style.color = 'var(--text-primary)';
        generateSequentialID(); // Reset လုပ်လျှင် ID ပြန်တောင်းမည်
    });

    document.getElementById('btn-save-draft').addEventListener('click', () => {
        const entryData = {
            id: document.getElementById('entry-id').value,
            filledDate: filledDateInput.value,
            itineraries: document.getElementById('itineraries').value,
            boatId: document.getElementById('boat-id').value,
            department: document.getElementById('department').value,
            issuedDate: issuedDateInput.value,
            priceDrum: parseFloat(priceDrumInput.value) || 0,
            liter: parseFloat(literInput.value) || 0,
            priceLiter: parseFloat(priceLiterInput.value) || 0,
            totalAmount: totalAmountInput.value ? parseFloat(totalAmountInput.value.replace(/,/g, '')) : 0,
            marks: marksInput.value,
            photo: photoBase64,
            vocAmount: vocAmountInput.value ? parseFloat(vocAmountInput.value) : null,
            createdAt: new Date().toISOString()
        };

        const existingDrafts = JSON.parse(localStorage.getItem('fuel_drafts') || '[]');
        existingDrafts.push(entryData);
        localStorage.setItem('fuel_drafts', JSON.stringify(existingDrafts));

        alert('📝 Saved as draft successfully!');
        window.location.hash = '#/draft';
    });
}