import Dexie from "dexie";

export const db = new Dexie("bldlab");

db.version(1).stores({
   sheets: "_id, name, type, createdAt, updatedAt",
   settings: "key",
});