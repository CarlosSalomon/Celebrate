import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabaseSync('wedding_planner.db');

export const initDB = () => {

    db.execSync(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            eventId TEXT NOT NULL,
            content TEXT NOT NULL,
            date TEXT
        );
    `);
    console.log("SQLite: Tabla 'notes' inicializada");
};


export const addNoteLocal = (eventId, content) => {
    const statement = db.prepareSync(
        'INSERT INTO notes (eventId, content, date) VALUES ($eventId, $content, $date)'
    );
    try {
        statement.executeSync({
            $eventId: eventId,
            $content: content,
            $date: new Date().toISOString()
        });
        console.log("SQLite: Nota guardada");
    } finally {
        statement.finalizeSync();
    }
};


export const getNotesLocal = (eventId) => {
    const statement = db.prepareSync(
        'SELECT * FROM notes WHERE eventId = $eventId ORDER BY id DESC'
    );
    try {
        const result = statement.executeSync({ $eventId: eventId });
        // Convertimos el resultado a un array normal
        return result.getAllSync();
    } finally {
        statement.finalizeSync();
    }
};

// --- BORRAR NOTA ---
export const deleteNoteLocal = (id) => {
    const statement = db.prepareSync('DELETE FROM notes WHERE id = $id');
    try {
        statement.executeSync({ $id: id });
        console.log("SQLite: Nota eliminada");
    } finally {
        statement.finalizeSync();
    }
};