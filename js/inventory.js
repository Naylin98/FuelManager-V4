// js/inventory.js
import { SCRIPT_URL } from './config.js'; 

export function renderInventoryModule(container) {
    container.innerHTML = `
        <div class="module-wrapper">
            <!-- Navigation Tabs -->
            <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid rgba(150,150,150,0.2); padding-bottom: 10px; flex-wrap: wrap;">
                <button id="tab-stock-btn" class="btn-tab active" style="padding: 8px 16px; border-radius: 8px; cursor: pointer; border: none; background: #2563eb; color: white;">📦 Stock Summary</button>
                <button id="tab-add-item-btn" class="btn-tab" style="padding: 8px 16px; border-radius: 8px; cursor: pointer; border: none; background: rgba(150,150,150,0.1); color: var(--text-main);">➕ Add Master Item</button>
                <button id="tab-in-btn" class="btn-tab" style="padding: 8px 16px; border-radius: 8px; cursor: pointer; border: none; background: rgba(150,150,150,0.1); color: var(--text-main);">📥 Stock IN (အဝင်)</button>
                <button id="tab-out-btn" class="btn-tab" style="padding: 8px 16px; border-radius: 8px; cursor: pointer; border: none; background: rgba(150,150,150,0.1); color: var(--text-main);">📤 Stock OUT (အထွက်)</button>
            </div>

            <!-- Tab 1: Current Stock Summary -->
            <div id="tab-stock-view" class="tab-content" style="display: block;">
                <div class="glass-panel" style="padding: 20px; border-radius: 12px;">
                    <h3>📊 Stock Status Overview</h3>
                    <div id="inventory-loading" style="text-align: center; padding: 20px;">⏳ Loading Inventory Data...</div>
                    <div style="overflow-x: auto; margin-top: 15px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead>
                                <tr style="border-bottom: 2px solid rgba(150,150,150,0.3); background: rgba(150,150,150,0.05);">
                                    <th style="padding: 10px; text-align: left;">Item Code</th>
                                    <th style="padding: 10px; text-align: left;">Item Name</th>
                                    <th style="padding: 10px; text-align: left;">Item Type</th>
                                    <th style="padding: 10px; text-align: right;">Total IN</th>
                                    <th style="padding: 10px; text-align: right;">Total OUT</th>
                                    <th style="padding: 10px; text-align: right;">Current Balance</th>
                                    <th style="padding: 10px; text-align: center;">Photo</th>
                                </tr>
                            </thead>
                            <tbody id="stock-summary-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tab 2: Add Master Item Form -->
            <div id="tab-add-item-view" class="tab-content" style="display: none;">
                <div class="glass-panel" style="padding: 25px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
                    <h3 style="color: #2563eb; margin-top: 0; margin-bottom: 20px;">➕ Register New Master Item (ပစ္စည်းအသစ်ထည့်ရန်)</h3>
                    <form id="add-master-item-form">
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Item Code</label>
                            <input type="text" id="master-item-code" class="form-control" placeholder="ဥပမာ - ITM-001" style="width:100%; padding:8px;" required>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Item Name</label>
                            <input type="text" id="master-item-name" class="form-control" placeholder="ပစ္စည်းအမည်" style="width:100%; padding:8px;" required>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Item Type / Category</label>
                            <input type="text" id="master-item-category" class="form-control" placeholder="ဥပမာ - Electronics, Furniture" style="width:100%; padding:8px;" required>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Upload Item Photo</label>
                            <input type="file" id="master-item-file" class="form-control" accept="image/*" style="width:100%; padding:6px;">
                            <div id="master-photo-preview" style="margin-top: 8px; text-align: center;"></div>
                        </div>
                        <button type="submit" id="btn-save-master" style="width:100%; padding:10px; background:#2563eb; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">💾 Save Master Item</button>
                    </form>
                </div>
            </div>

            <!-- Tab 3: Stock IN Form -->
            <div id="tab-in-view" class="tab-content" style="display: none;">
                <div class="glass-panel" style="padding: 25px; border-radius: 12px; max-width: 900px; margin: 0 auto;">
                    <h3 style="color: #16a34a; margin-top: 0; margin-bottom: 20px;">📥 Stock IN Form (ပစ္စည်းအဝင်)</h3>
                    
                    <form id="stock-in-form" style="display: grid; grid-template-columns: 1fr 320px; gap: 25px; align-items: start;">
                        <div>
                            <div style="margin-bottom: 15px;">
                                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">In Date</label>
                                <input type="date" id="in-date" class="form-control" style="width:100%; padding:8px;" required>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Select Item Code</label>
                                <select id="in-item-code-select" class="form-control" style="width:100%; padding:8px;" required>
                                    <option value="">-- Select Item Code from List --</option>
                                </select>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Item Name (Auto)</label>
                                <input type="text" id="in-item-name" class="form-control" style="width:100%; padding:8px; background:rgba(150,150,150,0.1);" readonly required>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Item Type / Category (Auto)</label>
                                <input type="text" id="in-item-category" class="form-control" style="width:100%; padding:8px; background:rgba(150,150,150,0.1);" readonly required>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Quantity</label>
                                <input type="number" id="in-quantity" class="form-control" placeholder="0" min="1" style="width:100%; padding:8px;" required>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Marks / Remarks</label>
                                <textarea id="in-remarks" class="form-control" placeholder="Note/Remarks..." style="width:100%; padding:8px;" rows="3"></textarea>
                            </div>
                            <button type="submit" id="btn-save-in" style="width:100%; padding:10px; background:#16a34a; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">📥 Save Stock IN</button>
                        </div>

                        <div style="background: rgba(150,150,150,0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(150,150,150,0.2); text-align: center;">
                            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:10px; text-align: left;">🖼️ Item Photo View (Large)</label>
                            <input type="hidden" id="in-photo">
                            <div id="in-photo-preview" style="width: 100%; height: 260px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.05); border-radius: 6px; overflow: hidden; border: 1px dashed rgba(150,150,150,0.4);">
                                <span style="color: var(--text-muted); font-size: 13px;">No Image Available</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Tab 4: Stock OUT POS Grid View -->
            <div id="tab-out-view" class="tab-content" style="display: none;">
                <div class="glass-panel" style="padding: 25px; border-radius: 12px; max-width: 900px; margin: 0 auto;">
                    <h3 style="color: #dc2626; margin-top: 0;">📤 Stock OUT (POS Photo Grid View)</h3>
                    
                    <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px;">
                            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Out Date</label>
                            <input type="date" id="out-date" class="form-control" style="width:100%; padding:8px;" required>
                        </div>
                        <div style="flex: 2; min-width: 250px;">
                            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">🔍 Search Item</label>
                            <input type="text" id="out-search-input" class="form-control" placeholder="Search by name or code..." style="width:100%; padding:8px;">
                        </div>
                    </div>

                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px;">👇 Stock ထုတ်လိုသော ပစ္စည်းပုံကို နှိပ်ပါ (Click item to checkout)</p>
                    <div id="pos-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 15px; max-height: 400px; overflow-y: auto; padding: 5px; border: 1px solid rgba(150,150,150,0.2); border-radius: 8px;"></div>
                </div>
            </div>
        </div>

        <!-- POS Quantity Modal Popup -->
        <div id="pos-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center;">
            <div class="glass-panel" style="background: var(--bg-card, #fff); padding: 25px; border-radius: 12px; width: 350px; max-width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h3 id="modal-item-title" style="margin-top: 0; color: #2563eb; font-size: 16px;">Item Name</h3>
                <p id="modal-item-code" style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;"></p>
                
                <form id="pos-checkout-form">
                    <input type="hidden" id="modal-item-code-val">
                    <input type="hidden" id="modal-item-name-val">
                    <input type="hidden" id="modal-item-category-val">
                    <input type="hidden" id="modal-item-photo-val">

                    <div style="margin-bottom: 15px; text-align: center;" id="modal-img-preview"></div>
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Quantity to OUT</label>
                        <input type="number" id="modal-out-qty" class="form-control" placeholder="1" min="1" value="1" style="width:100%; padding:10px; font-size: 16px; text-align: center;" required>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Marks / Reason</label>
                        <textarea id="modal-out-remarks" class="form-control" placeholder="Reason..." style="width:100%; padding:8px;" rows="2"></textarea>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" id="modal-cancel-btn" style="flex: 1; padding: 10px; background: rgba(150,150,150,0.2); border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Cancel</button>
                        <button type="submit" id="modal-confirm-btn" style="flex: 1; padding: 10px; background: #dc2626; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Confirm OUT</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Image Preview Modal for Stock Summary -->
        <div id="image-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1100; justify-content: center; align-items: center;">
            <div style="position: relative; background: var(--bg-card, #fff); padding: 15px; border-radius: 12px; max-width: 90%; max-height: 90%; text-align: center;">
                <button type="button" id="image-modal-close" style="position: absolute; top: 5px; right: 10px; background: none; border: none; font-size: 20px; font-weight: bold; cursor: pointer; color: #666;">&times;</button>
                <img id="image-modal-src" src="" style="max-width: 100%; max-height: 75vh; border-radius: 6px; object-fit: contain;" alt="Enlarged View">
            </div>
        </div>
    `;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('in-date').value = today;
    document.getElementById('out-date').value = today;

    let inventoryRawData = [];
    let masterItemsList = [];
    fetchInventoryData();

    // Tab Elements
    const tabStockBtn = document.getElementById('tab-stock-btn');
    const tabAddItemBtn = document.getElementById('tab-add-item-btn');
    const tabInBtn = document.getElementById('tab-in-btn');
    const tabOutBtn = document.getElementById('tab-out-btn');

    const tabStockView = document.getElementById('tab-stock-view');
    const tabAddItemView = document.getElementById('tab-add-item-view');
    const tabInView = document.getElementById('tab-in-view');
    const tabOutView = document.getElementById('tab-out-view');

    function switchTab(activeBtn, activeView) {
        [tabStockBtn, tabAddItemBtn, tabInBtn, tabOutBtn].forEach(b => {
            b.style.background = 'rgba(150,150,150,0.1)';
            b.style.color = 'var(--text-main)';
        });
        [tabStockView, tabAddItemView, tabInView, tabOutView].forEach(v => v.style.display = 'none');

        activeBtn.style.background = '#2563eb';
        activeBtn.style.color = 'white';
        activeView.style.display = 'block';
    }

    tabStockBtn.addEventListener('click', () => switchTab(tabStockBtn, tabStockView));
    tabAddItemBtn.addEventListener('click', () => switchTab(tabAddItemBtn, tabAddItemView));
    tabInBtn.addEventListener('click', () => switchTab(tabInBtn, tabInView));
    tabOutBtn.addEventListener('click', () => switchTab(tabOutBtn, tabOutView));

    async function fetchInventoryData() {
        try {
            const res = await fetch(`${SCRIPT_URL}?action=getInventory`);
            const json = await res.json();
            
            const resMaster = await fetch(`${SCRIPT_URL}?action=getItemsList`);
            const jsonMaster = await resMaster.json();

            if (jsonMaster.status === 'success') {
                masterItemsList = jsonMaster.data;
                populateInItemDropdown(masterItemsList);
                renderPosGrid(masterItemsList);
            }

            if (json.status === 'success') {
                inventoryRawData = json.data;
                renderSummaryTable(inventoryRawData);
            }
        } catch (err) {
            console.error("Inventory Fetch Error:", err);
            document.getElementById('inventory-loading').innerHTML = "⚠️ Error loading data.";
        }
    }

    // --- Add Master Item Form Logic ---
    let selectedFileBase64 = null;
    let selectedFileName = null;
    let selectedFileMimeType = null;

    // File Selection Preview & Base64 Conversion
    document.getElementById('master-item-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('master-photo-preview');
        
        if (file) {
            selectedFileName = file.name;
            selectedFileMimeType = file.type;

            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                const base64Data = uploadEvent.target.result;
                selectedFileBase64 = base64Data.split(',')[1]; // Base64 string သီးသန့်ဖြတ်ယူခြင်း
                preview.innerHTML = `<img src="${base64Data}" style="max-height: 120px; border-radius: 6px; border: 1px solid #ccc;" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            selectedFileBase64 = null;
            preview.innerHTML = '';
        }
    });

    // Handle Save Master Item Submit
    document.getElementById('add-master-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-master');
        btn.disabled = true;
        btn.innerText = "⏳ Uploading Photo & Saving...";

        const payload = {
            action: "saveMasterItem",
            itemCode: document.getElementById('master-item-code').value,
            itemName: document.getElementById('master-item-name').value,
            itemCategory: document.getElementById('master-item-category').value,
            fileData: selectedFileBase64,
            fileName: selectedFileName,
            mimeType: selectedFileMimeType
        };

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.result === "success") {
                alert("✅ Master Item and Photo uploaded successfully!");
                document.getElementById('add-master-item-form').reset();
                document.getElementById('master-photo-preview').innerHTML = '';
                selectedFileBase64 = null;
                selectedFileName = null;
                selectedFileMimeType = null;
                fetchInventoryData();
                switchTab(tabStockBtn, tabStockView);
            } else {
                alert("❌ Failed to save: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Save Master Error:", err);
            alert("❌ Network or Script Error!");
        } finally {
            btn.disabled = false;
            btn.innerText = "💾 Save Master Item";
        }
    });

    // Stock IN Form Item Code Change Event
    document.getElementById('in-item-code-select').addEventListener('change', function() {
        const selectedOpt = this.options[this.selectedIndex];
        const name = selectedOpt.getAttribute('data-name') || '';
        const category = selectedOpt.getAttribute('data-category') || '';
        const photo = selectedOpt.getAttribute('data-photo') || '';

        document.getElementById('in-item-name').value = name;
        document.getElementById('in-item-category').value = category;
        document.getElementById('in-photo').value = photo;

        const previewDiv = document.getElementById('in-photo-preview');
        if (photo) {
            previewDiv.innerHTML = `<a href="${photo}" target="_blank" style="display:flex; width:100%; height:100%; align-items:center; justify-content:center;"><img src="${photo}" style="max-width:100%; max-height:250px; object-fit:contain; border-radius:4px;" alt="Large Preview"></a>`;
        } else {
            previewDiv.innerHTML = `<span style="color: var(--text-muted); font-size: 13px;">No Image Available</span>`;
        }
    });

    function populateInItemDropdown(items) {
        const select = document.getElementById('in-item-code-select');
        select.innerHTML = '<option value="">-- Select Item Code --</option>';

        items.forEach(i => {
            const opt = document.createElement('option');
            opt.value = i.itemCode;
            opt.setAttribute('data-name', i.itemName);
            opt.setAttribute('data-category', i.itemCategory);
            opt.setAttribute('data-photo', i.photo || '');
            opt.textContent = `[${i.itemCode}] ${i.itemName}`;
            select.appendChild(opt);
        });
    }

    function renderSummaryTable(data) {
        document.getElementById('inventory-loading').style.display = 'none';
        const tbody = document.getElementById('stock-summary-tbody');
        tbody.innerHTML = '';

        const summaryMap = {};
        data.forEach(item => {
            const code = item.itemCode || "UNKNOWN";
            if (!summaryMap[code]) {
                summaryMap[code] = { itemName: item.itemName || "-", itemCategory: item.itemCategory || "-", inQty: 0, outQty: 0, photo: item.photo };
            }
            const qty = Number(item.quantity) || 0;
            const itemType = (item.type || item.Type || "").toUpperCase(); 

            if (itemType === 'IN') summaryMap[code].inQty += qty;
            else if (itemType === 'OUT') summaryMap[code].outQty += qty;
            if (item.photo) summaryMap[code].photo = item.photo;
        });

        Object.keys(summaryMap).forEach(code => {
            const item = summaryMap[code];
            const balance = item.inQty - item.outQty;
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(150,150,150,0.15)';
            
            let photoHtml = '-';
            if (item.photo) {
                photoHtml = `<img src="${item.photo}" class="table-thumb-img" data-url="${item.photo}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 1px solid #ccc;" title="Click to view large image" alt="Photo">`;
            }

            tr.innerHTML = `
                <td style="padding:10px; font-weight:600; color:#2563eb;">${code}</td>
                <td style="padding:10px; font-weight:600;">${item.itemName}</td>
                <td style="padding:10px; color:var(--text-muted);">${item.itemCategory}</td>
                <td style="padding:10px; text-align:right; color:#16a34a;">+${item.inQty.toLocaleString()}</td>
                <td style="padding:10px; text-align:right; color:#dc2626;">-${item.outQty.toLocaleString()}</td>
                <td style="padding:10px; text-align:right; font-weight:bold;">${balance.toLocaleString()}</td>
                <td style="padding:10px; text-align:center;">${photoHtml}</td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to thumbnails for popup view
        document.querySelectorAll('.table-thumb-img').forEach(img => {
            img.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                const modal = document.getElementById('image-modal');
                const modalImg = document.getElementById('image-modal-src');
                modalImg.src = url;
                modal.style.display = 'flex';
            });
        });
    }

    // Image Modal Close Events
    document.getElementById('image-modal-close').addEventListener('click', () => {
        document.getElementById('image-modal').style.display = 'none';
    });
    document.getElementById('image-modal').addEventListener('click', (e) => {
        if (e.target.id === 'image-modal') {
            document.getElementById('image-modal').style.display = 'none';
        }
    });

    function renderPosGrid(items) {
        const gridContainer = document.getElementById('pos-grid-container');
        gridContainer.innerHTML = '';

        if (!items || items.length === 0) {
            gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted);">No items found in Master List.</p>`;
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'pos-item-card';
            card.style.cssText = `
                background: rgba(150,150,150,0.05); border: 1px solid rgba(150,150,150,0.2); border-radius: 8px;
                padding: 10px; text-align: center; cursor: pointer; transition: transform 0.2s, background 0.2s;
                display: flex; flex-direction: column; justify-content: space-between;
            `;
            const photoUrl = item.photo || 'https://via.placeholder.com/100?text=No+Image';

            card.innerHTML = `
                <div>
                    <img src="${photoUrl}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" alt="${item.itemName}">
                    <div style="font-size: 11px; color: #2563eb; font-weight: bold;">${item.itemCode}</div>
                    <div style="font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.itemName}">${item.itemName}</div>
                </div>
                <div style="font-size: 10px; color: var(--text-muted); margin-top: 5px;">${item.itemCategory || ''}</div>
            `;

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-3px)';
                card.style.background = 'rgba(37, 99, 235, 0.1)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.background = 'rgba(150,150,150,0.05)';
            });
            card.addEventListener('click', () => openPosModal(item));
            gridContainer.appendChild(card);
        });
    }

    document.getElementById('out-search-input').addEventListener('input', function(e) {
        const keyword = e.target.value.toLowerCase();
        const filtered = masterItemsList.filter(i => 
            (i.itemName && i.itemName.toLowerCase().includes(keyword)) || 
            (i.itemCode && i.itemCode.toLowerCase().includes(keyword)) ||
            (i.itemCategory && i.itemCategory.toLowerCase().includes(keyword))
        );
        renderPosGrid(filtered);
    });

    function openPosModal(item) {
        document.getElementById('modal-item-title').textContent = item.itemName;
        document.getElementById('modal-item-code').textContent = `Code: ${item.itemCode} | Category: ${item.itemCategory || '-'}`;
        document.getElementById('modal-item-code-val').value = item.itemCode;
        document.getElementById('modal-item-name-val').value = item.itemName;
        document.getElementById('modal-item-category-val').value = item.itemCategory || '';
        document.getElementById('modal-item-photo-val').value = item.photo || '';

        const imgPreview = document.getElementById('modal-img-preview');
        imgPreview.innerHTML = item.photo ? `<img src="${item.photo}" style="max-height: 100px; border-radius: 6px; border: 1px solid #ccc;" alt="Preview">` : '';

        document.getElementById('modal-out-qty').value = 1;
        document.getElementById('modal-out-remarks').value = '';
        document.getElementById('pos-modal').style.display = 'flex';
        document.getElementById('modal-out-qty').focus();
    }

    document.getElementById('modal-cancel-btn').addEventListener('click', () => {
        document.getElementById('pos-modal').style.display = 'none';
    });

    // Handle Stock IN Submit
    document.getElementById('stock-in-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-in');
        btn.disabled = true;
        btn.innerText = "⏳ Saving...";

        const payload = {
            action: "saveInventory",
            id: "IN-" + Date.now(),
            date: document.getElementById('in-date').value,
            type: "IN",
            itemCode: document.getElementById('in-item-code-select').value,
            itemName: document.getElementById('in-item-name').value,
            itemCategory: document.getElementById('in-item-category').value,
            quantity: document.getElementById('in-quantity').value,
            photo: document.getElementById('in-photo').value,
            remarks: document.getElementById('in-remarks').value
        };

        try {
            await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
            alert("✅ Stock IN saved successfully!");
            document.getElementById('stock-in-form').reset();
            document.getElementById('in-date').value = today;
            document.getElementById('in-photo-preview').innerHTML = `<span style="color: var(--text-muted); font-size: 13px;">No Image Available</span>`;
            fetchInventoryData();
            switchTab(tabStockBtn, tabStockView);
        } catch (err) {
            alert("❌ Failed to save!");
        } finally {
            btn.disabled = false;
            btn.innerText = "📥 Save Stock IN";
        }
    });

    // Handle POS Modal Submit (Stock OUT)
    document.getElementById('pos-checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('modal-confirm-btn');
        btn.disabled = true;
        btn.innerText = "⏳ Processing...";

        const payload = {
            action: "saveInventory",
            id: "OUT-" + Date.now(),
            date: document.getElementById('out-date').value,
            type: "OUT",
            itemCode: document.getElementById('modal-item-code-val').value,
            itemName: document.getElementById('modal-item-name-val').value,
            itemCategory: document.getElementById('modal-item-category-val').value,
            quantity: document.getElementById('modal-out-qty').value,
            photo: document.getElementById('modal-item-photo-val').value,
            remarks: document.getElementById('modal-out-remarks').value
        };

        try {
            await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
            alert("✅ Stock OUT saved successfully!");
            document.getElementById('pos-modal').style.display = 'none';
            fetchInventoryData();
            switchTab(tabStockBtn, tabStockView);
        } catch (err) {
            alert("❌ Failed to save Stock OUT!");
        } finally {
            btn.disabled = false;
            btn.innerText = "Confirm OUT";
        }
    });
}