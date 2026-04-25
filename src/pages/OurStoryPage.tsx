import heroImg from '@/assets/hero-coffee.jpg';

const OurStoryPage = () => (
  <main className="section-padding">
    <div className="container-narrow mx-auto max-w-3xl">
      <div className="text-center mb-12 animate-fade-in">
        <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">Since 2018</p>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold">Our Story</h1>
      </div>

      <div className="warm-card p-8 sm:p-12 mb-10 animate-fade-in">
        <img src={heroImg} alt="Eighty Plus café" className="w-full h-64 sm:h-80 rounded-2xl object-cover mb-8" />
        <h2 className="text-2xl font-serif font-bold mb-4">Why "Eighty Plus"?</h2>
        <div className="prose prose-lg text-muted-foreground space-y-4">
          <p>
            Eighty Plus was born from a simple idea: that a great cup of coffee can elevate everything — conversations, ideas, friendships, and even quiet moments of peace. Our founders, passionate about specialty coffee and community, wanted to create more than just a café. They envisioned a warm, inviting space where every sip inspires and every visit feels like coming home.
          </p>
          <p>
            The name "Eighty Plus" reflects our commitment to sourcing and serving only the highest-scoring specialty-grade coffees — beans rated 80 points and above on the global quality scale. It's our promise that every cup meets an exceptional standard of flavor, aroma, and craftsmanship.
          </p>
          <p>
            Today, Eighty Plus is a beloved neighborhood gathering spot where artisan coffee meets heartfelt hospitality. We're proud to serve our community one exceptional cup at a time.
          </p>
        </div>
      </div>

      {/* Video Section */}
      <div className="warm-card p-8 text-center">
        <h2 className="text-xl font-serif font-bold mb-4">A Message from Our Founder</h2>
        <div className="aspect-video rounded-2xl overflow-hidden bg-secondary flex items-center justify-center">
          <div className="text-center text-muted-foreground p-8">
            <p className="text-sm">Video coming soon</p>
            <p className="text-xs mt-1">A 30-second message from our founder about the passion behind Eighty Plus</p>
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default OurStoryPage;
