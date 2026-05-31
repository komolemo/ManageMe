import { memo } from "react";

export const SubjectCell = memo(function SubjectCell({
  subject,
}: {
  subject: string;
}) {
  return <span className="truncate font-medium">{subject}</span>;
});
