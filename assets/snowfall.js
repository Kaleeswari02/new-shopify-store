const snowfallContainer = document.querySelector(".christmas-snowfall");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!snowfallContainer || reducedMotion.matches) {
  snowfallContainer?.remove();
} else {
  const flakeGlyphs = ["❄", "•"];
  const targetFlakes = window.innerWidth < 750 ? 16 : 28;

  const createFlake = () => {
    const flake = document.createElement("span");
    const size = (Math.random() * 0.9 + 0.55).toFixed(2);
    const opacity = (Math.random() * 0.45 + 0.4).toFixed(2);
    const drift = `${Math.round(Math.random() * 120 - 60)}px`;
    const duration = `${(Math.random() * 5 + 8).toFixed(2)}s`;

    flake.className = "christmas-snowflake";
    flake.textContent =
      flakeGlyphs[Math.floor(Math.random() * flakeGlyphs.length)];
    flake.style.setProperty("--left", `${Math.random() * 100}vw`);
    flake.style.setProperty("--size", `${size}rem`);
    flake.style.setProperty("--opacity", opacity);
    flake.style.setProperty("--drift", drift);
    flake.style.setProperty("--duration", duration);
    flake.style.animationDelay = `${Math.random() * -10}s`;
    flake.addEventListener("animationend", () => flake.remove(), {
      once: true,
    });

    snowfallContainer.append(flake);
  };

  const fillSnowfall = () => {
    while (snowfallContainer.childElementCount < targetFlakes) {
      createFlake();
    }
  };

  fillSnowfall();

  const intervalId = window.setInterval(() => {
    if (
      !document.hidden &&
      snowfallContainer.childElementCount < targetFlakes
    ) {
      createFlake();
    }
  }, 900);

  window.addEventListener(
    "pagehide",
    () => {
      window.clearInterval(intervalId);
    },
    { once: true },
  );

  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      window.clearInterval(intervalId);
      snowfallContainer.remove();
    }
  });
}
