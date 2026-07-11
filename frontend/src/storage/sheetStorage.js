import { db } from "./bldlabDb";

export function createLocalSheetId() {
   return `local-${crypto.randomUUID()}`;
}

export function isLocalSheetId(id) {
   return typeof id === "string" && id.startsWith("local-");
}

export async function getLocalSheets() {
   return db.sheets.orderBy("createdAt").toArray();
}

export async function getLocalSheetById(sheetId) {
   return db.sheets.get(sheetId);
}

export async function saveLocalSheet(sheet) {
   const now = new Date().toISOString();

   const sheetToSave = {
      ...sheet,
      _id: sheet._id ?? createLocalSheetId(),
      createdAt: sheet.createdAt ?? now,
      updatedAt: now,
      storageType: "local",
   };

   await db.sheets.put(sheetToSave);

   return sheetToSave;
}

export async function deleteLocalSheet(sheetId) {
   return db.sheets.delete(sheetId);
}