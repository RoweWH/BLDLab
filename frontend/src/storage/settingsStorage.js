import { db } from "./bldlabDb";

export const SETTINGS_KEY = "settings";

export const defaultSpeffzLetterScheme = {
   edges: {
      UB: "A", UR: "B", UF: "C", UL: "D",
      LU: "E", LF: "F", LD: "G", LB: "H",
      FU: "I", FR: "J", FD: "K", FL: "L",
      RU: "M", RB: "N", RD: "O", RF: "P",
      BU: "Q", BL: "R", BD: "S", BR: "T",
      DF: "U", DR: "V", DB: "W", DL: "X",
   },
   corners: {
      UBL: "A", UBR: "B", UFR: "C", UFL: "D",
      LUB: "E", LUF: "F", LDF: "G", LDB: "H",
      FUL: "I", FUR: "J", FDR: "K", FDL: "L",
      RUF: "M", RUB: "N", RDB: "O", RDF: "P",
      BUR: "Q", BUL: "R", BDL: "S", BDR: "T",
      DFL: "U", DFR: "V", DBR: "W", DBL: "X",
   },
};

export function normalizeLetterScheme(letterScheme) {
   return {
      edges: {
         ...defaultSpeffzLetterScheme.edges,
         ...(letterScheme?.edges ?? {}),
      },
      corners: {
         ...defaultSpeffzLetterScheme.corners,
         ...(letterScheme?.corners ?? {}),
      },
   };
}

export const defaultSettings = {
   key: SETTINGS_KEY,
   letterScheme: defaultSpeffzLetterScheme,
};

export async function getLocalSettings() {
   const settings = await db.settings.get(SETTINGS_KEY);

   if (!settings) {
      await db.settings.put(defaultSettings);
      return defaultSettings;
   }

   return {
      ...defaultSettings,
      ...settings,
      letterScheme: normalizeLetterScheme(settings.letterScheme),
   };
}

export async function saveLocalLetterScheme(letterScheme) {
   const updatedSettings = {
      key: SETTINGS_KEY,
      letterScheme: normalizeLetterScheme(letterScheme),
      updatedAt: new Date().toISOString(),
   };

   await db.settings.put(updatedSettings);
   return updatedSettings;
}