import { useParams } from "react-router";

export default function CourseEdit() {
  const { courseId } = useParams();
  return (
    <section>
      <h1 className="text-xl font-semibold">Edit course {courseId}</h1>
      {/* ponytail: placeholder — course form + its challenges editor */}
      <p className="text-muted-foreground">Course + challenges editor goes here.</p>
    </section>
  );
}
