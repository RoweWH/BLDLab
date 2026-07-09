import { Link } from "react-router-dom";
import { useSyncExternalStore } from "react";
import logoDark from "../assets/BLDLabLogoDark.png";
import logoLight from "../assets/BLDLabLogoLight.png";
import "./Home.css";

function getThemeSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

function subscribeToTheme(callback) {
  const obs = new MutationObserver(callback);

  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => obs.disconnect();
}

export function Home() {
  const dark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => false,
  );

  return (
    <main className="home-page">
      <section className="home-hero">
        <img
          src={dark ? logoDark : logoLight}
          alt="BLDLab"
          height="120px"
          width="auto"
        />

        <p>
          BLDLab is a collaborative blindfolded cubing algorithm database and
          sheet management tool. Browse community-contributed algorithms,
          organize your preferred solutions, and build personalized algorithm
          and word sheets.
        </p>
      </section>

      <section className="home-grid" aria-label="BLDLab navigation">
        <Link className="home-card" to="/edges">
          <h2>Edges</h2>
          <p>Browse algorithms.</p>
        </Link>

        <Link className="home-card" to="/corners">
          <h2>Corners</h2>
          <p>Browse algorithms.</p>
        </Link>

        <Link className="home-card" to="/2e2c">
          <h2>2E2C</h2>
          <p>Browse algorithms.</p>
        </Link>

        <Link className="home-card" to="/ltct">
          <h2>LTCT/T2C</h2>
          <p>Browse algorithms.</p>
        </Link>

        <Link className="home-card home-card--primary" to="/sheets">
          <h2>Sheets</h2>
          <p>Create and organize personalized algorithm and word sheets.</p>
        </Link>
      </section>

      <section className="home-section">
        <h2>Current beta focus</h2>
        <p>
          BLDLab is currently in beta. This release focuses on providing a
          shared algorithm database and practical sheet organization tools. More
          features are actively being developed, as well as a cleaner UI. Please note: some data created during this testing period may not be preserved when
          BLDLab is officially released. 
        </p>
      </section>

      <section className="home-section">
        <h2>Future features</h2>

        <ul className="home-future-list">
          <li>Additional algsets</li>
          <li>Algorithm trainer with multiple training modes</li>
          <li>Browser and cloud synchronization for personal sheets</li>
          <li>Improved algorithm verification and duplicate detection</li>
          <li>Algorithm discovery and generation tools</li>
          <li>Integrated timer for 3BLD and Multi-Blind attempts</li>
          <li>Multi-Blind data tracking and performance analysis tools</li>
          <li>Community profiles, sharing, and collaboration features</li>
        </ul>
      </section>
    </main>
  );
}
