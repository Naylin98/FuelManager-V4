// js/inventory.js

export function renderInventoryModule(container) {
    container.innerHTML = `
        <div class="inventory-container">
            <div class="inventory-header">
                <h3>📦 Tank Inventory & Stock</h3>
                <div class="inventory-actions">
                    <input type="text" id="search-tank" class="inventory-search" placeholder="Search tanks...">
                </div>
            </div>
            
            <div id="tank-grid" class="tank-grid">
                <!-- Tanks will be rendered here -->
            </div>
        </div>
    `;

    loadInventoryData();
}

function loadInventoryData() {
    // API မချိတ်ရသေးမီ Mock Data အသုံးပြုထားပါသည်
    const tanksData = [
        { id: 'T-01', name: 'Tank 1', type: 'Octane 92 Ron', capacity: 10000, currentStock: 7500 },
        { id: 'T-02', name: 'Tank 2', type: 'Octane 95 Ron', capacity: 8000, currentStock: 2400 },
        { id: 'T-03', name: 'Tank 3', type: 'Premium Diesel', capacity: 12000, currentStock: 1100 }
    ];

    renderTanks(tanksData);
    
    // Search Functionality
    document.getElementById('search-tank').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = tanksData.filter(tank => 
            tank.name.toLowerCase().includes(keyword) || 
            tank.type.toLowerCase().includes(keyword)
        );
        renderTanks(filtered);
    });
}

function renderTanks(data) {
    const grid = document.getElementById('tank-grid');
    grid.innerHTML = '';

    data.forEach(tank => {
        // Calculate Percentage
        const percentage = Math.round((tank.currentStock / tank.capacity) * 100);
        
        // Determine Color Class based on stock level
        let levelClass = 'level-safe'; // > 50%
        if (percentage <= 20) {
            levelClass = 'level-danger';
        } else if (percentage <= 50) {
            levelClass = 'level-warning';
        }

        const tankCard = document.createElement('div');
        tankCard.className = 'glass-panel tank-card';
        tankCard.innerHTML = `
            <div class="tank-visual-container">
                <div class="tank-level ${levelClass}" style="height: ${percentage}%"></div>
            </div>
            
            <div class="tank-details">
                <h4 class="tank-title">${tank.name}</h4>
                <span class="tank-type">${tank.type}</span>
                
                <div class="tank-stat">
                    <span>Capacity:</span>
                    <strong>${tank.capacity.toLocaleString()} L</strong>
                </div>
                <div class="tank-stat">
                    <span>Current Stock:</span>
                    <strong>${tank.currentStock.toLocaleString()} L</strong>
                </div>
                
                <div class="progress-text ${percentage <= 20 ? 'text-danger' : ''}">
                    ${percentage}% Full
                </div>

                <button class="btn-refill" onclick="alert('Refill action for ${tank.name} will be implemented.')">
                    ➕ Refill Tank
                </button>
            </div>
        `;
        
        grid.appendChild(tankCard);
    });
}