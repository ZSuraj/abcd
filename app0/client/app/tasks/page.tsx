"use client";

export default function Tasks() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        {currentUser?.data.user.type === "client" && <div>client</div>}

        {currentUser?.data.user.type === "employee" && <div>employees</div>}

        {currentUser?.data.user.type === "admin" && <div>admin</div>}
      </main>
    </div>
  );
}
