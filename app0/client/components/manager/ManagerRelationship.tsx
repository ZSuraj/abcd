import { Search } from "lucide-react";
import ManagerRelationshipTreeView from "./ManagerRelationshipTreeView";
import { Input } from "../ui/input";
import { useState } from "react";

export default function ManagerRelationship() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Relationships</h2>
      </div>
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ManagerRelationshipTreeView searchTerm={searchTerm} />
    </div>
  );
}