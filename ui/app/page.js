import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      <div className="center-screen">
        <div className="container" style={{ maxWidth: 880 }}>
          <p className="eyebrow text-center">Engineers&rsquo; Day // Live Technical Fire Round</p>
          <h1 className="hero-title text-center">
            COOK <span className="red">OR</span> GET COOKED
          </h1>
          <p className="hero-sub text-center" style={{ margin: '0 auto 40px' }}>
            Three rounds. Randomized sets so nobody sees a question twice. A debugging finale that
            ends with a treasure chest. Pick how you&rsquo;re joining.
          </p>

          <div className="two-col">
            <Link href="/participant/login" className="poster-card">
              <h3>I&rsquo;m a participant</h3>
              <p>Log in with your team name and PIN, see your assigned set, and play when your round opens.</p>
            </Link>
            <Link href="/admin/login" className="poster-card">
              <h3>I&rsquo;m the controller</h3>
              <p>Manage teams, randomize group assignments, run the live leaderboard, and control Round 3.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
