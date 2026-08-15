// js/api.js
import { SCRIPT_URL } from './config.js';

// 1. Transactions Data ရယူရန်
export async function fetchTransactionsFromSheet() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getTransactions`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data || []; 
    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
        return []; 
    }
}

// 2. Inventory / Stock Data ရယူရန်
export async function fetchInventoryFromSheet() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getInventory`); 
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.warn("Error fetching inventory data:", error);
        return [];
    }
}

// 3. Signature ရယူရန် (GET Request)
export async function fetchSignature() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getSignature`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return data; // { url: "...", base64: "..." }
    } catch (error) {
        console.error("Error fetching signature:", error);
        return { url: "", base64: "" };
    }
}

// 4. Signature သိမ်းဆည်းရန် (POST Request)
export async function saveSignature(base64Data) {
    try {
        const payload = {
            action: 'saveSignature',
            signature: base64Data
        };

        const response = await fetch(SCRIPT_URL, { 
            method: 'POST',
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error("Error in saveSignature API:", error);
        throw error;
    }
}