import { useState } from "react";
import { Kanban } from "lucide-react";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { Item } from "@/components/app/ItemCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/pages/PageShell";
import type { PageKey } from "@/pages/pageTypes";

type ProjectListPageProps = {
  onNavigate: (page: PageKey) => void;
};

const initialProjects = [
  { name: "ManageMe Core", milestone: "ph-1-0", status: "騾ｲ陦御ｸｭ", progress: 68 },
  { name: "Knowledge Wiki", milestone: "ph-1-0", status: "險ｭ險井ｸｭ", progress: 42 },
  { name: "Desktop Shell", milestone: "ph-1-1", status: "繝ｬ繝薙Η繝ｼ", progress: 81 },
];

export function ProjectListPage({ onNavigate }: ProjectListPageProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const saveEditingTitle = (projectIndex: number, title: string) => {
    setProjects((currentProjects) =>
      currentProjects.map((project, index) =>
        index === projectIndex ? { ...project, name: title } : project
      )
    );
  };

  const resetCreateDialog = () => {
    setNewProjectName("");
    setIsCreateDialogOpen(false);
  };

  const createProject = () => {
    const nextProjectName = newProjectName.trim();

    if (!nextProjectName) {
      return;
    }

    setProjects((currentProjects) => [
      ...currentProjects,
      {
        name: nextProjectName,
        milestone: "",
        status: "",
        progress: 0,
      },
    ]);
    resetCreateDialog();
  };

  const duplicateProject = (projectIndex: number) => {
    setProjects((currentProjects) => {
      const projectToDuplicate = currentProjects[projectIndex];

      if (!projectToDuplicate) {
        return currentProjects;
      }

      const existingProjectNames = new Set(
        currentProjects.map((project) => project.name)
      );
      const baseDuplicateName = `${projectToDuplicate.name} Copy`;
      let duplicateName = baseDuplicateName;
      let duplicateNumber = 2;

      while (existingProjectNames.has(duplicateName)) {
        duplicateName = `${baseDuplicateName} ${duplicateNumber}`;
        duplicateNumber += 1;
      }

      const duplicatedProject = {
        ...projectToDuplicate,
        name: duplicateName,
      };

      return [
        ...currentProjects.slice(0, projectIndex + 1),
        duplicatedProject,
        ...currentProjects.slice(projectIndex + 1),
      ];
    });
  };

  const copyProjectUrl = () => {
    void navigator.clipboard.writeText(window.location.href);
  };

  const deleteProject = (projectIndex: number) => {
    setProjects((currentProjects) =>
      currentProjects.filter((_, index) => index !== projectIndex)
    );

  };

  return (
    <PageShell badge="Projects / 1" title="Project List Page" description="">
      <div className="px-[32px]">
        <div className="mb-3 flex justify-end">
          <CreateNewButton
            onClick={() => setIsCreateDialogOpen(true)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3 pt-[16px] border-b">
          {projects.map((project, projectIndex) => (
            <Item
              Icon={Kanban}
              actions={[
                {
                  text: "Duplicate",
                  onClick: () => duplicateProject(projectIndex),
                },
                {
                  text: "Copy URL",
                  onClick: copyProjectUrl,
                },
                {
                  text: "Delete",
                  onClick: () => deleteProject(projectIndex),
                },
              ]}
              itemDescription={project.milestone}
              itemName={project.name}
              key={project.name}
              onSaveEditing={(title) => saveEditingTitle(projectIndex, title)}
              onSelect={() => {
                onNavigate("project");
              }}
            />
          ))}
        </div>
      </div>
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsCreateDialogOpen(true);
            return;
          }

          resetCreateDialog();
        }}
      >
        <DialogContent className="p-[16px] gap-[16px] max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle
              className="my-[4px] text-lg font-semibold leading-[18px] tracking-[0.02em] uppercase"
            >Create project</DialogTitle>
            <DialogDescription
              className="my-[4px] text-sm text-muted-foreground"
            >
              Enter a name for the new project.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid w-full min-w-0 gap-[16px]"
            onSubmit={(event) => {
              event.preventDefault();
              createProject();
            }}
          >
            <Input
              className="h-[36px] w-full min-w-0 box-border px-[8px] rounded-md"
              aria-label="Project name"
              autoFocus
              onChange={(event) => setNewProjectName(event.target.value)}
              placeholder="Project name"
              value={newProjectName}
            />
            <DialogFooter className="flex-row justify-end gap-[16px]">
              <Button
                className="w-[100px] p-[8px] rounded-md text-foreground"
                onClick={resetCreateDialog}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="w-[100px] p-[8px] rounded-md bg-[#238636] hover:bg-[#2ea043] text-[#fff]"
                disabled={!newProjectName.trim()}
                type="submit"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
