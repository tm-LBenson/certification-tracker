import React from "react";
import { Link } from "react-router-dom";
import { Instructor } from "../AdminPage";

const InstructorList: React.FC<{ instructors: Instructor[] }> = ({
  instructors,
}) => {
  return (
    <div>
      <ul>
        {instructors.map((instructor) => (
          <li
            key={instructor.id}
            className="border-b p-2"
          >
            <Link
              to={`/instructors/${instructor.id}`}
              className="text-blue-600 hover:underline"
            >
              {instructor.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstructorList;
