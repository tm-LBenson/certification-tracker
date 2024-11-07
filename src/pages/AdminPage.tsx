import InstructorList from "./adminComponents/InstructorList";
import ChecklistManager from "./adminComponents/ChecklistManager";

export interface Instructor {
  id: string;
  name: string;
}
interface AdminPageProps {
  instructors: Instructor[];
}
const AdminPage: React.FC<AdminPageProps> = ({ instructors }) => {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Admin Dashboard
      </h2>
      <div className="mb-10">
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Instructor List
        </h3>
        <InstructorList instructors={instructors} />
      </div>
      <div>
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Checklist Manager
        </h3>
        <ChecklistManager instructors={instructors} />
      </div>
    </div>
  );
};

export default AdminPage;
