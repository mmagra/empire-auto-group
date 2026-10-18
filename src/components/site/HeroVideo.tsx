/**
 * Full-screen background video for the home hero. Big screens get 1440p, phones
 * the lighter 720p; the poster shows instantly while it loads (and instead of
 * the video for visitors who prefer reduced motion).
 *
 * Footage: Pexels video 29498827 (free for commercial use, no attribution), a
 * computer-rendered white supercar in a garage. Checked at 4K: the front badge
 * is blank, with no readable logo, name or plate. Plays forward then in reverse
 * so the loop is seamless.
 *
 * On desktop the video fills the right part of the hero and fades into black on
 * its left edge, so the car sits beside the headline instead of behind it.
 */
export function HeroVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black" aria-hidden>
      <div className="absolute inset-y-0 right-0 w-full bg-cover bg-center lg:w-[58%]" style={{ backgroundImage: "url(/video/hero-poster.webp)" }}>
        <video className="hero-video h-full w-full object-cover" autoPlay muted loop playsInline preload="auto" poster="/video/hero-poster.webp">
          <source src="/video/hero-720.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src="/video/hero-1440.mp4" type="video/mp4" media="(min-width: 1800px)" />
          <source src="/video/hero-1080.mp4" type="video/mp4" />
        </video>
        {/* Soft fade from the black left side into the video (desktop) */}
        <div className="absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-black via-black/60 to-transparent lg:block" />
      </div>
      {/* Legibility: darker on phones where text sits over the car, lighter on desktop */}
      <div className="absolute inset-0 bg-black/55 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/10 lg:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent via-40% to-black/50 lg:to-black/30" />
    </div>
  );
}
