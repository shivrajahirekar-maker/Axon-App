import { useState } from "react";
import placeholderImg from "../assets/placeholder.webp";

interface FinalProps {
  heroName: string;
  guideName: string;
}

export function Final({ heroName, guideName }: FinalProps) {
  const [note, setNote] = useState("");
  const colors = ["var(--color-cta)", "var(--color-accent-orange)", "var(--pastel-2-accent)", "var(--pastel-3-accent)"];

  return (
    <div className="center-col">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <i
            key={i}
            style={{
              left: `${i * 10 + 2}%`,
              background: colors[i % colors.length],
              transform: `rotate(${(i * 37) % 45}deg)`,
              animation: `fall 1.1s ${i * 0.05}s ease-in both`,
            }}
          />
        ))}
      </div>
      <div className="illus" style={{ maxHeight: 150 }} aria-hidden="true">
        <img src={placeholderImg} alt="" />
      </div>
      <h2 className="screen-title">{heroName} is ready for what's next</h2>
      <p className="screen-sub" style={{ maxWidth: 280 }}>
        {guideName}: "I'll be here at every bend. The trail goes on, and so does the story."
      </p>
      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: 6 }}
        onClick={() => setNote("This is where Today/Home would open — out of scope for this round.")}
      >
        Enter AXON_APP
      </button>
      <p className="form-note">{note}</p>
    </div>
  );
}
