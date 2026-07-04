import { useRef, useState } from "react";
import { ArrowLeft, GripVertical, Info, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/course-edit";
import { getEditCourse, type Challenge, type ChallengeStatus } from "~/lib/mock-data";
import { AdminFormHeader, CourseForm } from "~/components/course-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

export function loader({ params }: Route.LoaderArgs) {
  return { course: getEditCourse(params.courseId) };
}

export function meta() {
  return [{ title: "Edit course · CodeClass" }];
}

const statusPill: Record<ChallengeStatus, string> = {
  done: "bg-success-soft text-success-soft-foreground",
  current: "bg-warning-soft text-warning-soft-foreground",
  locked: "bg-muted text-muted-foreground",
};

export default function CourseEdit({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;
  const [challenges, setChallenges] = useState<Challenge[]>(course.challenges);
  const [editing, setEditing] = useState<Challenge | null | undefined>(undefined); // undefined = closed
  const dragIndex = useRef<number | null>(null);

  function drop(to: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === to) return;
    setChallenges((list) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      // ponytail: persist the new day/order to the backend on drop
      return next.map((c, i) => ({ ...c, day: i + 1 }));
    });
  }

  return (
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <Link
        to="/admin/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        My courses
      </Link>

      <AdminFormHeader title="Edit course" action={<Button>Save changes</Button>} />

      <div className="space-y-6">
        <CourseForm
          title={course.title}
          description={course.description}
          difficulty={course.difficulty}
          visibility={course.status}
        />

        <Card className="border p-6">
          <CardHeader className="flex-row items-center justify-between px-0">
            <CardTitle className="text-lg font-bold">
              Challenges · unlock in order, one per day
            </CardTitle>
            <Button variant="outline" onClick={() => setEditing(null)}>
              <Plus />
              Add challenge
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y rounded-xl border">
              {challenges.map((c, i) => (
                <li
                  key={c.id}
                  draggable
                  onDragStart={() => (dragIndex.current = i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => drop(i)}
                  className="flex items-center gap-3 bg-card px-3 py-3 first:rounded-t-xl last:rounded-b-xl"
                >
                  <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
                  <span className="w-6 shrink-0 font-mono text-sm text-muted-foreground">
                    {String(c.day).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-medium">{c.title}</span>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
                      statusPill[c.status]
                    )}
                  >
                    {c.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit challenge"
                    onClick={() => setEditing(c)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label="Delete challenge"
                    onClick={() => setChallenges((l) => l.filter((x) => x.id !== c.id))}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <ChallengeDialog
        editing={editing}
        onClose={() => setEditing(undefined)}
      />
    </main>
  );
}

function ChallengeDialog({
  editing,
  onClose,
}: {
  editing: Challenge | null | undefined;
  onClose: () => void;
}) {
  const isEdit = !!editing;
  return (
    <Dialog open={editing !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit challenge" : "Add challenge"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this challenge's prompt and starter code."
              : "It'll be added as the next day in the unlock sequence"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-title">Title</Label>
            <Input id="c-title" defaultValue={editing?.title} placeholder="e.g. Recursion Basics" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-points">Points</Label>
            <Input
              id="c-points"
              type="number"
              className="w-[120px]"
              defaultValue={editing?.points ?? 20}
            />
          </div>

          <Tabs defaultValue="description">
            <TabsList variant="line" className="gap-4 border-b">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="starter">Starter code</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-2 pt-3">
              <p className="text-xs text-muted-foreground">
                What should students do? Shown in the Instructions tab.
              </p>
              <Textarea rows={5} placeholder="Describe the problem, expected behavior, and an example if useful..." />
            </TabsContent>
            <TabsContent value="starter" className="space-y-2 pt-3">
              <p className="text-xs text-muted-foreground">Pre-fills the student's editor.</p>
              <Textarea
                rows={5}
                spellCheck={false}
                className="bg-[#1e1e1e] font-mono text-[13px] text-[#d4d4d4]"
                placeholder="// starter code"
              />
            </TabsContent>
            <TabsContent value="hints" className="space-y-2 pt-3">
              <p className="text-xs text-muted-foreground">Shown in the student's Hints tab.</p>
              <Textarea rows={5} placeholder="Nudge students toward the idea without giving it away..." />
            </TabsContent>
          </Tabs>

          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            The reference solution and automated tests that grade this challenge are configured on the
            backend, not here.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {/* ponytail: persist via POST/PATCH then close */}
          <Button onClick={onClose}>{isEdit ? "Save changes" : "Add challenge"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
