
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FiActivity,
  FiChevronDown,
  FiClipboard,
  FiFlag,
  FiLogOut,
  FiPlus,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// --- API Helper Function ---
const apiRequest = async (url, method, token, body = null) => {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`
    );
  }
  return response.json();
};

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Active");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();

  const loggedInAdmin = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !loggedInAdmin || loggedInAdmin.role !== "admin") {
      navigate("/login");
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

        // Fetch employees and tasks concurrently with the correct URLs
        const [employeesData, tasksData] = await Promise.all([
          apiRequest(`${apiUrl}/api/admin/employees`, "GET", token),
          apiRequest(`${apiUrl}/api/admin/tasks`, "GET", token),
        ]);

        setEmployees(employeesData);
        setTasks(tasksData);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("401") || err.message.includes("403")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate, token]);

  const handleInputChange = (e) =>
    setNewTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignedTo)
      return alert("Please provide a title and assign the task.");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const createdTaskData = await apiRequest(
        `${apiUrl}/api/admin/tasks`,
        "POST",
        token,
        newTask
      );
      const newTaskWithEmployee = {
        ...createdTaskData,
        assignedTo: employees.find(
          (emp) => emp._id === createdTaskData.assignedTo
        ),
      };
      setTasks((prevTasks) => [newTaskWithEmployee, ...prevTasks]);
      setNewTask({
        title: "",
        description: "",
        assignedTo: "",
        priority: "Medium",
        dueDate: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await apiRequest(`${apiUrl}/api/auth/logout`, "POST", token);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const getFilteredTasks = () => {
    if (filter === "Active") return tasks.filter((t) => t.status !== "Done");
    if (filter === "Completed") return tasks.filter((t) => t.status === "Done");
    return tasks;
  };

  if (!loggedInAdmin) return null;

  return (
    <div
      className="min-h-screen font-sans text-white/90 bg-slate-900"
      style={{
        backgroundImage: `radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.1) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.1) 0px, transparent 50%)`,
      }}
    >
      <header className="sticky top-0 z-40 bg-slate-900/50 backdrop-blur-md border-b border-slate-700/60">
        <div className="max-w-screen-2xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-full bg-slate-800 border border-slate-700"
            >
              <img
                src={loggedInAdmin.avatar}
                alt="Admin"
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden sm:block text-sm font-semibold pr-2">
                {loggedInAdmin.name}
              </span>
              <FiChevronDown
                className={clsx("transition-transform mr-1", {
                  "rotate-180": isProfileOpen,
                })}
              />
            </motion.button>
            <AnimatePresence>
              {isProfileOpen && (
                <ProfileDropdown
                  admin={loggedInAdmin}
                  onLogout={handleLogout}
                  close={() => setIsProfileOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
      <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-12"
        >
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            className="lg:col-span-2 xl:col-span-1"
          >
            <SectionHeader icon={<FiUser />} title="Team Status" />
            <div className="space-y-5">
              {loading ? (
                <p className="text-center text-white/50">
                  Loading employees...
                </p>
              ) : (
                employees.map((emp) => (
                  <EmployeeCard key={emp._id} employee={emp} tasks={tasks} />
                ))
              )}
            </div>
          </motion.div>
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
          >
            <SectionHeader icon={<FiClipboard />} title="Assign New Task" />
            <TaskAssignmentForm
              {...{ newTask, handleInputChange, handleAssignTask, employees }}
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            className="lg:col-span-2 xl:col-span-1"
          >
            <SectionHeader icon={<FiActivity />} title="Global Task Feed" />
            <div className="flex items-center gap-2 p-1 bg-slate-800/60 backdrop-blur-sm rounded-xl mb-6">
              {["Active", "Completed", "All"].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={clsx(
                    "w-full py-2.5 text-sm font-semibold rounded-lg transition-colors",
                    {
                      "bg-indigo-600 text-white shadow-md": filter === tab,
                      "text-white/60 hover:text-white/100": filter !== tab,
                    }
                  )}
                >
                  {tab}
                </motion.button>
              ))}
            </div>
            <motion.div
              layout
              className="space-y-5 h-[70vh] overflow-y-auto pr-2"
            >
              <AnimatePresence>
                {loading ? (
                  <div className="text-center text-white/50">
                    Loading tasks...
                  </div>
                ) : error ? (
                  <div className="text-center text-red-400 bg-red-500/20 p-4 rounded-lg">
                    {error}
                  </div>
                ) : (
                  getFilteredTasks().map((task) => (
                    <AdminTaskCard key={task._id} task={task} />
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

// --- Child Components ---

const ProfileDropdown = ({ admin, onLogout, close }) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        close();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);
  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute top-full right-0 mt-2 w-64 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-700">
        <p className="font-bold text-white">{admin.name}</p>
      </div>
      <div className="p-2">
        <motion.button
          whileHover={{ backgroundColor: "rgba(71,85,105,0.5)" }}
          onClick={onLogout}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
        >
          <FiLogOut /> Logout
        </motion.button>
      </div>
    </motion.div>
  );
};

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="bg-slate-800 p-3 rounded-lg">{icon}</div>
    <h2 className="text-2xl font-bold">{title}</h2>
  </div>
);

const EmployeeCard = ({ employee, tasks }) => {
  const taskCount = tasks.filter(
    (t) => t.assignedTo._id === employee._id && t.status !== "Done"
  ).length;
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="flex items-center gap-5 p-5 rounded-2xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60"
    >
      <img
        src={employee.avatar}
        alt={employee.name}
        className="w-14 h-14 rounded-full border-2 border-slate-600"
      />
      <div className="flex-grow">
        <p className="font-bold text-lg text-white">{employee.name}</p>
        <p className="text-sm text-white/60">{employee.role}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div
          className={clsx(
            "flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full",
            {
              "bg-green-500/20 text-green-400": employee.status === "Online",
              "bg-slate-600/50 text-slate-400": employee.status === "Offline",
            }
          )}
        >
          <div
            className={clsx("w-2 h-2 rounded-full", {
              "bg-green-400": employee.status === "Online",
              "bg-slate-500": employee.status === "Offline",
            })}
          />
          {employee.status}
        </div>
        <p className="text-xs text-white/50">{taskCount} active</p>
      </div>
    </motion.div>
  );
};

const TaskAssignmentForm = ({
  newTask,
  handleInputChange,
  handleAssignTask,
  employees,
}) => {
  const commonInputClass =
    "w-full bg-slate-900/80 border border-slate-600 rounded-lg p-4 text-base text-white/90 focus:ring-2 focus:ring-indigo-500 focus:outline-none";
  return (
    <form
      onSubmit={handleAssignTask}
      className="p-8 rounded-2xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60 space-y-5"
    >
      <input
        type="text"
        name="title"
        value={newTask.title}
        onChange={handleInputChange}
        placeholder="Task Title"
        required
        className={commonInputClass}
      />
      <textarea
        name="description"
        value={newTask.description}
        onChange={handleInputChange}
        placeholder="Task Description"
        className={`${commonInputClass} min-h-[120px]`}
      />
      <div className="grid grid-cols-2 gap-4">
        <select
          name="assignedTo"
          value={newTask.assignedTo}
          onChange={handleInputChange}
          required
          className={commonInputClass}
        >
          <option value="" disabled>
            Assign to...
          </option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name}
            </option>
          ))}
        </select>
        <select
          name="priority"
          value={newTask.priority}
          onChange={handleInputChange}
          className={commonInputClass}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <input
        type="date"
        name="dueDate"
        value={newTask.dueDate}
        onChange={handleInputChange}
        className={commonInputClass}
      />
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <FiPlus /> Assign Task
      </motion.button>
    </form>
  );
};

const AdminTaskCard = ({ task }) => {
  const priorityConfig = {
    High: "text-red-400",
    Medium: "text-yellow-400",
    Low: "text-sky-400",
  };
  const assignedEmployee = task.assignedTo;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ y: -5 }}
      className="p-5 rounded-2xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60"
    >
      <div className="flex justify-between items-start mb-3">
        <p className="font-bold text-white pr-4">{task.title}</p>
        <span
          className={clsx(
            "flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold",
            priorityConfig[task.priority]
          )}
        >
          <FiFlag size={14} /> {task.priority}
        </span>
      </div>
      <p className="text-sm text-white/60 mb-4">{task.description}</p>
      <div className="border-t border-slate-700/60 pt-3 flex items-center justify-between">
        {assignedEmployee ? (
          <div className="flex items-center gap-2">
            <img
              src={assignedEmployee.avatar}
              alt={assignedEmployee.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-white/70">
              {assignedEmployee.name}
            </span>
          </div>
        ) : (
          <div />
        )}
        <span className="text-xs text-white/50">
          {task.status === "Done" ? "Completed" : task.status}
        </span>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
