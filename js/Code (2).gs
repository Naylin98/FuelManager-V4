// (၁) GET Request (Dropdown list များနှင့် Main Data များကို ဖတ်ရန်)
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action || "fuel";

  // ၁။ Boat IDs များကို တောင်းဆိုလျှင်
  if (action === "boats") {
    var sheet = ss.getSheetByName("Boat_IDs");
    var rows = sheet ? sheet.getDataRange().getValues() : [];
    if (rows.length > 1) rows.shift();
    var boats = rows.map(function(row) { return row[0]; }).filter(String);
    return ContentService.createTextOutput(JSON.stringify(boats)).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ၂။ Departments များကို တောင်းဆိုလျှင်
  if (action === "departments") {
    var sheet = ss.getSheetByName("Departments");
    var rows = sheet ? sheet.getDataRange().getValues() : [];
    if (rows.length > 1) rows.shift();
    var depts = rows.map(function(row) { return row[0]; }).filter(String);
    return ContentService.createTextOutput(JSON.stringify(depts)).setMimeType(ContentService.MimeType.JSON);
  }
  if (e.parameter.action === 'getSignature') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("signature image");
    var url = "";
    var base64 = "";
    
    if (sheet) {
      url = sheet.getRange("A1").getValue(); // Sheet ထဲရှိ Drive URL ကို ယူမည်
      
      // Excel Export အတွက် Drive ပုံကို Base64 အဖြစ် ပြောင်းပေးမည်
      if (url && url.indexOf("id=") > -1) {
        try {
          var fileId = url.split("id=")[1];
          var file = DriveApp.getFileById(fileId);
          var blob = file.getBlob();
          base64 = "data:" + blob.getContentType() + ";base64," + Utilities.base64Encode(blob.getBytes());
        } catch(err) {
          // Error Handling
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ url: url, base64: base64 }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  // ၃။ ပုံမှန် Fuel Entry Main Data များကို တောင်းဆိုလျှင် (Default)
  var sheet = ss.getSheetByName("Fuel Management Database");
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  
  var rows = sheet.getDataRange().getValues();

  if (rows.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }

  var headers = rows.shift(); // ခေါင်းစဉ်တန်းကို ဖယ်ထုတ်သည်

  var data = rows.map(function(row) {
    var originalPhotoUrl = String(row[11] || '');
    var thumbnailUrl = originalPhotoUrl;
    var fileId = "";
    
    // Google Drive လင့်ခ်အမျိုးအစားအလိုက် File ID ကို ရှာဖွေဆွဲထုတ်ခြင်း
    if (originalPhotoUrl.includes('drive.google.com/file/d/')) {
      var match = originalPhotoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    } else if (originalPhotoUrl.includes('id=')) {
      var matchId = originalPhotoUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) {
        fileId = matchId[1];
      }
    }

    // File ID ရရှိပါက sz=w500 ပါသည့် URL ပုံစံသို့ ပြောင်းလဲခြင်း
    if (fileId) {
      thumbnailUrl = "https://drive.google.com/uc?export=view&id=" + fileId + "&sz=w500";
    }

    return {
      id: String(row[0] || ''),           // Col A: ID
      filledDate: row[1] || '',           // Col B: Filled Date
      itineraries: row[2] || '',          // Col C: Itineraries
      boatId: row[3] || '',               // Col D: Boat ID
      department: row[4] || '',           // Col E: Departments
      issuedDate: row[5] || '',           // Col F: Issued Date
      priceDrum: row[6] || 0,             // Col G: Price/Drum
      liter: row[7] || 0,                 // Col H: Liter
      priceLiter: row[8] || 0,            // Col I: Price/Liter
      totalAmount: row[9] || 0,           // Col J: Total Amount
      marks: row[10] || '',               // Col K: Marks
      photo: thumbnailUrl,                // Col L: Thumbnail လင့်ခ်အသစ်
      vocAmount: row[12] !== "" ? row[12] : null, // Col M: Voc Amount
      createdAt: row[13] || ''            // Col N: Created At
    };
  });

  // 🔴 အရေးကြီးဆုံး: ပြုပြင်ပြီးသား Data များကို Client ဘက်သို့ JSON ဖြင့် ပြန်ပို့ပေးရန် return ထည့်ပေးခြင်း
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
// (၂) POST Request (Boat/Dept အသစ်ထည့်ခြင်း၊ ပြင်ဆင်ခြင်း၊ ဖျက်ခြင်းနှင့် Main Entry သိမ်းခြင်း)
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var data = payload.data;
    
    // --- 1. Boat ID Actions ---
    if (action === 'add_boat') {
      var sheet = ss.getSheetByName("Boat_IDs");
      if (!sheet) { sheet = ss.insertSheet("Boat_IDs"); sheet.appendRow(["Boat ID"]); }
      sheet.appendRow([data.value]);
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === 'edit_boat' || action === 'delete_boat') {
      var sheet = ss.getSheetByName("Boat_IDs");
      if (sheet) {
        var rows = sheet.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          if (rows[i][0] == data.oldValue) {
            if (action === 'delete_boat') {
              sheet.deleteRow(i + 1);
            } else {
              sheet.getRange(i + 1, 1).setValue(data.newValue);
            }
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- 2. Department Actions ---
    if (action === 'add_department') {
      var sheet = ss.getSheetByName("Departments");
      if (!sheet) { sheet = ss.insertSheet("Departments"); sheet.appendRow(["Department"]); }
      sheet.appendRow([data.value]);
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === 'edit_department') {
      var sheet = ss.getSheetByName("Departments");
      if (sheet) {
        var rows = sheet.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          if (rows[i][0] == data.oldValue) {
            sheet.getRange(i + 1, 1).setValue(data.newValue);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }
// Code.gs ထဲရှိ doPost function ထဲမှ ဤအပိုင်းကို အောက်ပါအတိုင်း ပြင်ဆင်ပါ
    if (action === 'saveSignature') {
      
      // 🚨 သင့်ရဲ့ Drive Folder ID ကို ဒီမှာထည့်ပါ 🚨
      var folderId = "1wBtqEFlnRXPRk2P8Qn_sLdHB9SoB7lNs"; 
      var folder = DriveApp.getFolderById(folderId);
      
      // 🌟 ပြင်ဆင်ချက် - requestBody အစား payload ကို အသုံးပြုပါ 🌟
      var base64Data = payload.signature; 
      var contentType = "image/png";
      
      // Base64 Header ကို ဖြတ်ထုတ်ခြင်း
      if (base64Data.indexOf("data:") === 0) {
        var parts = base64Data.split(',');
        contentType = parts[0].split(';')[0].split(':')[1];
        base64Data = parts[1];
      }
      
      // Drive ထဲသို့ ပုံဖန်တီး၍ သိမ်းဆည်းခြင်း
      var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType, "Signature_" + new Date().getTime());
      var file = folder.createFile(blob);
      
      // URL ဖြင့် ဝင်ကြည့်နိုင်ရန် Permission ပေးခြင်း
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      var fileUrl = "https://drive.google.com/uc?id=" + file.getId()+"&sz=w500";
      
      // Sheet ထဲသို့ URL သိမ်းခြင်း
      var sheet = ss.getSheetByName("signature image");
      if (!sheet) {
        sheet = ss.insertSheet("signature image");
      }
      sheet.getRange("A1").setValue(fileUrl);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', url: fileUrl }))
                           .setMimeType(ContentService.MimeType.JSON);
    }    // --- 3. Main Fuel Entry Actions (Create / Update / Delete) ---
   var sheet = ss.getActiveSheet();
  var photoUrl = data.photo || "";
  if (photoUrl && photoUrl.startsWith("data:image")) {
    photoUrl = saveImageToGoogleDrive(photoUrl, data.id);
  }
  
  if (action === 'create') {
    sheet.appendRow([
      data.id,             // Col A: ID
      data.filledDate,     // Col B: Filled Date
      data.itineraries,    // Col C: Itineraries
      data.boatId,         // Col D: Boat ID
      data.department,     // Col E: Departments
      data.issuedDate,     // Col F: Issued Date
      data.priceDrum,      // Col G: Price/Drum
      data.liter,          // Col H: Liter
      data.priceLiter,     // Col I: Price/Liter
      data.totalAmount,    // Col J: Total Amount
      data.marks,          // Col K: Marks
      photoUrl,            // Col L: Photo (✅ ဤနေရာတွင် data.photo အစား photoUrl သို့ ပြင်ဆင်ထားသည်)
      data.vocAmount,      // Col M: Voc Amount
      data.createdAt       // Col N: Created At
    ]);
  } else if (action === 'update' || action === 'delete') {
    var rows = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.id) { rowIndex = i + 1; break; }
    }
    if (rowIndex > -1) {
      if (action === 'update') {
        var updatedRow = [
          data.id, data.filledDate, data.itineraries, 
          data.boatId, data.department, data.issuedDate, data.priceDrum, 
          data.liter, data.priceLiter, data.totalAmount, data.marks, 
          photoUrl, data.vocAmount, data.createdAt
        ];
        sheet.getRange(rowIndex, 1, 1, 14).setValues([updatedRow]);
      } else if (action === 'delete') {
        sheet.deleteRow(rowIndex);
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ "result": "success", "action": action })).setMimeType(ContentService.MimeType.JSON);
} catch (error) {
  return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() })).setMimeType(ContentService.MimeType.JSON);
}
}

// Google Drive သို့ ပုံသိမ်းသည့် Function
function saveImageToGoogleDrive(base64Data, fileId) {
  try {
    var folderId = "1wBtqEFlnRXPRk2P8Qn_sLdHB9SoB7lNs"; // သင့် Folder ID
    var folder = DriveApp.getFolderById(folderId);
    var parts = base64Data.split(";base64,");
    var contentType = parts[0].split(":")[1];
    var decodedBytes = Utilities.base64Decode(parts[1]);
    var blob = Utilities.newBlob(decodedBytes, contentType, "Voucher_" + fileId + ".png");
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Google Drive File ID ကို ယူ၍ Thumbnail / Direct Link ပုံစံသို့ ပြောင်းလဲခြင်း
    var fileId = file.getId();
    
    // w500 သို့မဟုတ် အလိုရှိသော size ဖြင့် ပုံကို တိုက်ရိုက်လှမ်းခေါ်နိုင်မည့် Link ပုံစံ
    // (သို့) Google Drive ၏ uc?export=view&id= ပုံစံကိုလည်း သုံးနိုင်သည်
    return "https://drive.google.com/uc?export=view&id=" + fileId + "&sz=w500";
    
  } catch (err) {
    return "Error: " + err.toString();
  }
}

// Google Apps Script (Code.gs) တွင် ထည့်ရန်

function saveSignatureToSheet(base64String) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Sheet အမည် 'signature image' ဟု ပေးထားရန် လိုအပ်သည်
  var sheet = ss.getSheetByName("signature image"); 
  
  if (!sheet) {
    // Sheet မရှိပါက အသစ်တည်ဆောက်မည်
    sheet = ss.insertSheet("signature image");
  }
  
  // A1 Cell တွင် Base64 Data ကို သိမ်းဆည်းမည်
  sheet.getRange("A1").setValue(base64String);
  return "Success";
}

function getSignatureFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("signature image");
  
  if (!sheet) {
    return ""; // Sheet မရှိသေးပါက ဘာမှမပြန်ပေးပါ
  }
  
  // A1 Cell ရှိ သိမ်းထားသော Base64 Data ကို ပြန်ခေါ်မည်
  var base64String = sheet.getRange("A1").getValue();
  return base64String;
}