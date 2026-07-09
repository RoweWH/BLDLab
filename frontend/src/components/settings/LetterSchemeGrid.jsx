import "./LetterSchemeGrid.css";

const faces = {
  U: [
    { type: "corners", key: "UBL" },
    { type: "edges", key: "UB" },
    { type: "corners", key: "UBR" },
    { type: "edges", key: "UL" },
    { center: "U" },
    { type: "edges", key: "UR" },
    { type: "corners", key: "UFL" },
    { type: "edges", key: "UF" },
    { type: "corners", key: "UFR" },
  ],
  L: [
    { type: "corners", key: "LUB" },
    { type: "edges", key: "LU" },
    { type: "corners", key: "LUF" },
    { type: "edges", key: "LB" },
    { center: "L" },
    { type: "edges", key: "LF" },
    { type: "corners", key: "LDB" },
    { type: "edges", key: "LD" },
    { type: "corners", key: "LDF" },
  ],
  F: [
    { type: "corners", key: "FUL" },
    { type: "edges", key: "FU" },
    { type: "corners", key: "FUR" },
    { type: "edges", key: "FL" },
    { center: "F" },
    { type: "edges", key: "FR" },
    { type: "corners", key: "FDL" },
    { type: "edges", key: "FD" },
    { type: "corners", key: "FDR" },
  ],
  R: [
    { type: "corners", key: "RUF" },
    { type: "edges", key: "RU" },
    { type: "corners", key: "RUB" },
    { type: "edges", key: "RF" },
    { center: "R" },
    { type: "edges", key: "RB" },
    { type: "corners", key: "RDF" },
    { type: "edges", key: "RD" },
    { type: "corners", key: "RDB" },
  ],
  B: [
    { type: "corners", key: "BUR" },
    { type: "edges", key: "BU" },
    { type: "corners", key: "BUL" },
    { type: "edges", key: "BR" },
    { center: "B" },
    { type: "edges", key: "BL" },
    { type: "corners", key: "BDR" },
    { type: "edges", key: "BD" },
    { type: "corners", key: "BDL" },
  ],
  D: [
    { type: "corners", key: "DFL" },
    { type: "edges", key: "DF" },
    { type: "corners", key: "DFR" },
    { type: "edges", key: "DL" },
    { center: "D" },
    { type: "edges", key: "DR" },
    { type: "corners", key: "DBL" },
    { type: "edges", key: "DB" },
    { type: "corners", key: "DBR" },
  ],
};

function Face({ name, stickers, scheme, onChange }) {
  return (
    <div className={`letter-face letter-face--${name.toLowerCase()}`}>
      {stickers.map((sticker, index) => {
        const cellId = `${name}-${index}`;

        if (sticker.center) {
          return (
            <div key={cellId} className="letter-face__cell letter-face__center">
              {sticker.center}
            </div>
          );
        }

        return (
          <input
            key={cellId}
            className="letter-face__cell letter-face__input"
            value={scheme[sticker.type]?.[sticker.key] ?? ""}
            maxLength={1}
            aria-label={`Letter for ${sticker.key}`}
            onChange={(event) =>
              onChange(
                sticker.type,
                sticker.key,
                event.target.value.toUpperCase(),
              )
            }
          />
        );
      })}
    </div>
  );
}

export function LetterSchemeGrid({ scheme, onChange }) {
  return (
    <div className="letter-scheme-grid">
      <Face name="U" stickers={faces.U} scheme={scheme} onChange={onChange} />
      <Face name="L" stickers={faces.L} scheme={scheme} onChange={onChange} />
      <Face name="F" stickers={faces.F} scheme={scheme} onChange={onChange} />
      <Face name="R" stickers={faces.R} scheme={scheme} onChange={onChange} />
      <Face name="B" stickers={faces.B} scheme={scheme} onChange={onChange} />
      <Face name="D" stickers={faces.D} scheme={scheme} onChange={onChange} />
    </div>
  );
}
