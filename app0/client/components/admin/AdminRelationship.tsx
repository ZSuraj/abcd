import { Search } from "lucide-react";
import RelationshipTreeView from "./RelationshipTreeView";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { fetchAllClients } from "@/lib/api";

export default function AdminRelationship() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-4">
      {/* <h1>AdminActions</h1> */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Relationship Management</h2>
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

      <RelationshipTreeView searchTerm={searchTerm} />
    </div>
  );
}
