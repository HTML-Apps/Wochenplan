(async () => {
    // Importiere nur die benötigten Funktionen, nicht die ganze App-Initialisierung
    const { getDoc, doc, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    // Nutze die bestehende, authentifizierte Datenbank-Instanz
    const db = window.db;

    if (!db) {
        console.error("Fehler: 'window.db' wurde nicht gefunden. Haben Sie die Zeile 'window.db = db;' hinzugefügt, die Datei gespeichert und die Seite neu geladen?");
        return;
    }

    // Hilfsfunktion zum Herunterladen der Daten als JSON
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

    console.log("Starte den Download mit Ihrer aktiven Anmeldung...");

    // 1. Download Wochenplan
    try {
        const planDoc = await getDoc(doc(db, "planung", "wochenplan2026"));
        if (planDoc.exists()) {
            downloadJSON(planDoc.data(), "wochenplan_data.json");
            console.log("Erfolg: wochenplan_data.json heruntergeladen.");
        } else {
            console.error("Dokument 'planung/wochenplan2026' nicht gefunden.");
        }
    } catch (e) {
        console.error("Fehler beim Download des Wochenplans:", e);
    }

    // 2. Download Speisekammer
    try {
        const speisekammerSnapshot = await getDocs(collection(db, "speisekammer"));
        const speisekammerData = speisekammerSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        downloadJSON(speisekammerData, "speisekammer_data.json");
        console.log("Erfolg: speisekammer_data.json heruntergeladen.");
    } catch (e) {
        console.error("Fehler beim Download der Speisekammer:", e);
    }

    // 3. Download Rezepte
    try {
        const rezepteSnapshot = await getDocs(collection(db, "rezepte"));
        const rezepteData = {};
        rezepteSnapshot.forEach(d => {
            rezepteData[d.id] = d.data();
        });
        downloadJSON(rezepteData, "rezepte_data.json");
        console.log("Erfolg: rezepte_data.json heruntergeladen.");
    } catch (e) {
        console.error("Fehler beim Download der Rezepte:", e);
    }

    console.log("Alle Downloads abgeschlossen.");
})();
