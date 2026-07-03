import { useParams } from "react-router";

export default function Challenge() {
  const { challengeId } = useParams();
  return (
    <section>
      <h1 className="text-xl font-semibold">Challenge {challengeId}</h1>
      {/* ponytail: placeholder — code editor + run/submit lives here.
          The code runner/checker is its own design (see scaffold spec). */}
      <p className="text-muted-foreground">Editor and submit go here.</p>
    </section>
  );
}
