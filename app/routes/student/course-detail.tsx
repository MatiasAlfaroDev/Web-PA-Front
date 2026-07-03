import { useParams } from "react-router";

export default function CourseDetail() {
  const { courseId } = useParams();
  return (
    <section>
      <h1 className="text-xl font-semibold">Course {courseId}</h1>
      {/* ponytail: placeholder — lessons + challenges list for this course */}
      <p className="text-muted-foreground">Lessons and challenges go here.</p>
    </section>
  );
}
