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
  // 🌟 ၄။ Viber Card အတွက် သီးသန့် ခေါ်ယူမည့် Action (Sheet မူရင်း မြန်မာစာအတိုင်း)
  if (action === "viber") {
    var sheet = ss.getSheetByName("Fuel Management Database");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Sheet မတွေ့ရှိပါ။" })).setMimeType(ContentService.MimeType.JSON);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Sheet ထဲတွင် ဒေတာ မရှိသေးပါ။" })).setMimeType(ContentService.MimeType.JSON);
    }

    var row = sheet.getRange(lastRow, 1, 1, 14).getValues()[0];

    var id = String(row[0] || '-');
    var boatId = String(row[3] || '-');
    var department = String(row[4] || '-');
    
    // 💡 Sheet ထဲရှိ မြန်မာစာ မူရင်းအတိုင်း အပြည့်အဝ ယူမည် (စာလုံးရေ မဖြတ်ပါ)
    var itineraries = String(row[2] || '-');
    
    var liter = row[7] ? Number(row[7]).toLocaleString() + ' L' : '0 L';
    var totalAmount = row[9] ? Number(row[9]).toLocaleString() + ' MMK' : '0 MMK';
    var issuedDate = row[5] ? (row[5] instanceof Date ? Utilities.formatDate(row[5], ss.getSpreadsheetTimeZone(), "dd/MMM/yyyy") : String(row[5])) : '-';

    // Base64 Image Conversion
    var rawPhotoUrl = String(row[11] || '');
    var fileId = "";
    var photoBase64 = "";

    if (rawPhotoUrl.includes('drive.google.com/file/d/')) {
      var match = rawPhotoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) fileId = match[1];
    } else if (rawPhotoUrl.includes('id=')) {
      var matchId = rawPhotoUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) fileId = matchId[1];
    }

    if (fileId) {
      try {
        var file = DriveApp.getFileById(fileId);
        var blob = file.getBlob();
        photoBase64 = "data:" + blob.getContentType() + ";base64," + Utilities.base64Encode(blob.getBytes());
      } catch(e) {
        console.error("Base64 error: " + e);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      id: id,
      boatId: boatId,
      department: department,
      itineraries: itineraries,
      liter: liter,
      totalAmount: totalAmount,
      issuedDate: issuedDate,
      photoBase64: photoBase64
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (e.parameter.action === 'getSignature') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("signature image");
    var url = "";
    var base64 = "";
    
    if (sheet) {
      url = sheet.getRange("A1").getValue(); // Sheet ထဲရှိ Drive URL ကို ယူမည်
      
      if (url && url.indexOf("id=") > -1) {
        try {
          // 🌟 ပြင်ဆင်ချက်: &sz=w500 စသည့် parameter များကို ဖယ်ထုတ်ပြီး File ID သီးသန့်ယူခြင်း
          var fileId = url.split("id=")[1].split("&")[0]; 
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
    // File ID ရရှိပါက Google Drive Thumbnail API ပုံစံသို့ ပြောင်းလဲခြင်း (CORS ပြဿနာကို သက်သာစေရန်)
    if (fileId) {
        thumbnailUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w500";
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
    
    // Frontend မှ data ကို payload.data အနေဖြင့်ပို့လျှင် ၎င်းကိုယူမည်၊ တိုက်ရိုက်ပို့လျှင် payload ကိုပင် data အဖြစ်ယူမည်
    var data = payload.data || payload; 
    
    // --- 0. Signup & Login Actions ---
    if (action === "signup") {
      var userSheet = ss.getSheetByName("User Record");
      if (!userSheet) return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Sheet not found!" })).setMimeType(ContentService.MimeType.JSON);
      
      var dataRange = userSheet.getDataRange().getValues();
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][1] === data.username) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Username already exists!" })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      var allowedTabs = data.role === "Admin" ? "All" : (data.allowedTabs ? data.allowedTabs.join(",") : "");
      userSheet.appendRow([new Date(), data.username, data.password, data.role, allowedTabs]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Signup successful!" })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (action === "login") {
      var loginSheet = ss.getSheetByName("User Record"); // ပြင်ဆင်ချက် - Login အတွက် Sheet ပြန်ခေါ်ပေးရမည်
      var dataRange = loginSheet.getDataRange().getValues();
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][1] === data.username && dataRange[i][2] === data.password) {
          return ContentService.createTextOutput(JSON.stringify({ 
            success: true, 
            user: {
              username: dataRange[i][1],
              role: dataRange[i][3],
              allowedTabs: dataRange[i][4]
            }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Invalid username or password" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- 1. Boat ID Actions ---
    if (action === 'add_boat') {
      var boatSheet = ss.getSheetByName("Boat_IDs");
      if (!boatSheet) { boatSheet = ss.insertSheet("Boat_IDs"); boatSheet.appendRow(["Boat ID"]); }
      boatSheet.appendRow([data.value]);
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === 'edit_boat' || action === 'delete_boat') {
      var boatSheetEdit = ss.getSheetByName("Boat_IDs");
      if (boatSheetEdit) {
        var rows = boatSheetEdit.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          if (rows[i][0] == data.oldValue) {
            if (action === 'delete_boat') {
              boatSheetEdit.deleteRow(i + 1);
            } else {
              boatSheetEdit.getRange(i + 1, 1).setValue(data.newValue);
            }
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- 2. Department Actions ---
    if (action === 'add_department') {
      var deptSheet = ss.getSheetByName("Departments");
      if (!deptSheet) { deptSheet = ss.insertSheet("Departments"); deptSheet.appendRow(["Department"]); }
      deptSheet.appendRow([data.value]);
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === 'edit_department') {
      var deptSheetEdit = ss.getSheetByName("Departments");
      if (deptSheetEdit) {
        var rows = deptSheetEdit.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          if (rows[i][0] == data.oldValue) {
            deptSheetEdit.getRange(i + 1, 1).setValue(data.newValue);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- Save Signature ---
    if (action === 'saveSignature') {
      var folderId = "1wBtqEFlnRXPRk2P8Qn_sLdHB9SoB7lNs"; 
      var folder = DriveApp.getFolderById(folderId);
      var base64Data = payload.signature || data.signature; // Fix for data source
      var contentType = "image/png";
      
      if (base64Data.indexOf("data:") === 0) {
        var parts = base64Data.split(',');
        contentType = parts[0].split(';')[0].split(':')[1];
        base64Data = parts[1];
      }
      
      var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType, "Signature_" + new Date().getTime());
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      var fileUrl = "https://drive.google.com/uc?id=" + file.getId()+"&sz=w500";
      
      var sigSheet = ss.getSheetByName("signature image");
      if (!sigSheet) { sigSheet = ss.insertSheet("signature image"); }
      sigSheet.getRange("A1").setValue(fileUrl);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', url: fileUrl })).setMimeType(ContentService.MimeType.JSON);
    } 

    // --- 3. Main Fuel Entry Actions (Create / Update / Delete) ---
    if (action === 'create' || action === 'update' || action === 'delete') {
      var mainSheet = ss.getActiveSheet();
      var photoUrl = data.photo || "";
      
      // မှတ်ချက်: ဤနေရာတွင် saveImageToGoogleDrive function ရှိနေပြီဟု ယူဆပါသည်
      if (photoUrl && photoUrl.startsWith("data:image")) {
        photoUrl = saveImageToGoogleDrive(photoUrl, data.id);
      }
      
      if (action === 'create') {
        mainSheet.appendRow([
          data.id, data.filledDate, data.itineraries, data.boatId, data.department, 
          data.issuedDate, data.priceDrum, data.liter, data.priceLiter, data.totalAmount, 
          data.marks, photoUrl, data.vocAmount, data.createdAt
        ]);
      } else if (action === 'update' || action === 'delete') {
        var rows = mainSheet.getDataRange().getValues();
        var rowIndex = -1;
        for (var i = 1; i < rows.length; i++) {
          if (rows[i][0] === data.id) { rowIndex = i + 1; break; }
        }
        if (rowIndex > -1) {
          if (action === 'update') {
            var updatedRow = [
              data.id, data.filledDate, data.itineraries, data.boatId, data.department, 
              data.issuedDate, data.priceDrum, data.liter, data.priceLiter, data.totalAmount, 
              data.marks, photoUrl, data.vocAmount, data.createdAt
            ];
            mainSheet.getRange(rowIndex, 1, 1, 14).setValues([updatedRow]);
          } else if (action === 'delete') {
            mainSheet.deleteRow(rowIndex);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ "result": "success", "action": action })).setMimeType(ContentService.MimeType.JSON);
    }

    // ဘာ Action မှ မကိုက်ညီပါက
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Unknown action requested" })).setMimeType(ContentService.MimeType.JSON);

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