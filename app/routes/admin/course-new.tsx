import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { AdminFormHeader, CourseForm } from "~/components/course-form";
import { Button } from "~/components/ui/button";

export function meta() {
  return [{ title: "New course · CodeClass" }];
}

export default function CourseNew() {
  return (
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <Link
        to="/admin/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        My courses
      </Link>

      <AdminFormHeader
        title="New course"
        subtitle="Set the basics now — add challenges after creating"
        action={<Button>Create course</Button>}
      />

      <CourseForm />

      <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Save this course to start adding daily challenges.
      </p>
    </main>
  );
}
