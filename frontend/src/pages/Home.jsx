import { Link } from "react-router-dom";
import "./Home.css";

export function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <h1>BLDLAB</h1>

        <p>
          A Rubik's Cube blindfolded solving algorithm database. More features
          coming soon!
        </p>
      </section>
    </div>
  );
}
