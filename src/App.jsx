import { useState } from "react";
import { injectStyles } from "./constants/tokens";
import Navbar         from "./components/Navbar";
import HomePage       from "./pages/HomePage";
import AboutPage      from "./pages/AboutPage";
import DetectionPage  from "./pages/DetectionPage";

export default function App() {
  injectStyles(); // inject CSS global sekali saat mount
  const [page, setPage] = useState("home");

  return (
    <div>
      <Navbar page={page} setPage={setPage} />

      {page === "home"      && <HomePage      setPage={setPage} />}
      {page === "about"     && <AboutPage     setPage={setPage} />}
      {page === "detection" && <DetectionPage setPage={setPage} />}
    </div>
  );
}
