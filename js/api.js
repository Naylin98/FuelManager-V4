// js/api.js

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYvzFOpcsTNxeGGrS6lJ1jG23-7p4Gqz4olWD1WLM7xvK1tdR4dZ9JomnxBRZ-UPep/exec'; 

export async function fetchTransactionsFromSheet() {
    try {
        const response = await fetch(SCRIPT_URL);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
        return []; 
    }
}

// 🌟 ပြင်ဆင်ထားသော fetchSignature (GET Request)
// js/api.js

export async function fetchSignature() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getSignature`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return data; // { url: "...", base64: "..." } ကို အပြည့်အစုံ ပြန်ပို့ပေးမည်
    } catch (error) {
        console.error("Error fetching signature:", error);
        return { url: "", base64: "" };
    }
}

// saveSignature နှင့် fetchTransactionsFromSheet တို့သည် ယခင်အတိုင်း ထားပါ။

// 🌟 ပြင်ဆင်ထားသော saveSignature (POST Request)
// js/api.js အတွင်းရှိ saveSignature function ကို အောက်ပါအတိုင်း အစားထိုးပါ
export async function saveSignature(base64Data) {
    try {
        const payload = {
            action: 'saveSignature',
            signature: base64Data
        };

        const response = await fetch(SCRIPT_URL, { 
            method: 'POST',
            // 🌟 ပြင်ဆင်ချက် - GAS အတွက် Header နှင့် Redirect ထည့်သွင်းခြင်း
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