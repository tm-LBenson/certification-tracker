import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 p-4 shadow-md mb-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">Codex Academy</div>
      </div>
    </nav>
  );
};

export default Navbar;
