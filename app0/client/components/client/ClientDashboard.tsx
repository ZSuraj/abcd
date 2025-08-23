import { ClientDocumentUpload } from "./ClientDocumentUpload";
import { User } from "@/types";

export default function ClientDashboard({ user }: { user: User }) {
  return (
    <div>
      <ClientDocumentUpload user={user as User} />
    </div>
  );
}
