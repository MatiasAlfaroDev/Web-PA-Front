import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

const difficulties = ["Beginner", "Intermediate", "Advanced"];
const visibilities = ["Published", "Draft"];

// Shared metadata form for creating and editing a course. Uncontrolled fields —
// wire up onSubmit persistence (POST/PATCH) when the API exists.
export function CourseForm({
  title = "",
  description = "",
  difficulty = "Beginner",
  visibility = "Draft",
}: {
  title?: string;
  description?: string;
  difficulty?: string;
  visibility?: string;
}) {
  return (
    <Card className="border p-6">
      <CardContent className="space-y-5 px-0">
        <div className="space-y-2">
          <Label htmlFor="title">Course title</Label>
          <Input id="title" defaultValue={title} placeholder="e.g. Intro to Python" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            defaultValue={description}
            placeholder="What will students learn in this course?"
          />
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <ToggleGroup type="single" defaultValue={difficulty} variant="outline" spacing={0}>
            {difficulties.map((d) => (
              <ToggleGroupItem key={d} value={d}>
                {d}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="space-y-2">
          <Label>Visibility</Label>
          <ToggleGroup type="single" defaultValue={visibility} variant="outline" spacing={0}>
            {visibilities.map((v) => (
              <ToggleGroupItem key={v} value={v}>
                {v}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
}

// Header shared by create/edit: back link + title + primary action.
export function AdminFormHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="mb-8 space-y-3">
      <div className="space-y-1">
        <h1 className="text-[28px] font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
