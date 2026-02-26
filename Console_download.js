(async () => {
    // This code re-uses the firebase libraries already loaded by the page.
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore, doc, getDoc, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    // Firebase config from your file
    const firebaseConfig = {
        apiKey: "AIzaSyCdK5VgOqwS2qZCcL0dzjEX6l21YxTkDM8",
        authDomain: "wochenplan-957ec.firebaseapp.com",
        projectId: "wochenplan-957ec",
        storageBucket: "wochenplan-957ec.firebasestorage.app",
        messagingSenderId: "662198750456",
        appId: "1:662198750456:web:31d9a7f2f6e21efa7f7f0d"
    };

    // Initialize a temporary app instance to get the data
    const tempApp = initializeApp(firebaseConfig, "tempDownloader");
    const tempDb = getFirestore(tempApp);

    // Helper function to download data as JSON
    function downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    console.log("Starte den Download der Daten... Bitte warten.");

    // 1. Download Wochenplan (the meal schedule)
    try {
        const planDoc = await getDoc(doc(tempDb, "planung", "wochenplan2026"));
        if (planDoc.exists()) {
            downloadJSON(planDoc.data(), "wochenplan_data.json");
            console.log("wochenplan_data.json heruntergeladen.");
        } else {
            console.error("Dokument 'planung/wochenplan2026' nicht gefunden.");
        }
    } catch (e) {
        console.error("Fehler beim Download des Wochenplans:", e);
    }


    // 2. Download Speisekammer (the list of meals)
    try {
        const speisekammerSnapshot = await getDocs(collection(tempDb, "speisekammer"));
        const speisekammerData = speisekammerSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        downloadJSON(speisekammerData, "speisekammer_data.json");
        console.log("speisekammer_data.json heruntergeladen.");
    } catch (e) {
        console.error("Fehler beim Download der Speisekammer:", e);
    }

    // 3. Download Rezepte (ingredients)
    try {
        const rezepteSnapshot = await getDocs(collection(tempDb, "rezepte"));
        const rezepteData = {};
        rezepteSnapshot.forEach(d => {
            rezepteData[d.id] = d.data();
        });
        downloadJSON(rezepteData, "rezepte_data.json");
        console.log("rezepte_data.json heruntergeladen.");
    } catch (e) {
        console.error("Fehler beim Download der Rezepte:", e);
    }

    console.log("Alle Downloads wurden gestartet. Bitte prüfen Sie Ihren Download-Ordner.");
})();
