
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiAlertOctagon,
  FiCheck,
  FiCheckSquare,
  FiClock,
  FiEdit2,
  FiFlag,
  FiLogOut,
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
    throw new Error(errorData.message || "An API error occurred.");
  }
  return response.json();
};

// Main Dashboard Component
const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Active");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: null,
    task: null,
  });
  const [modalText, setModalText] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();
  const loggedInEmployee = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Define apiUrl once to be used across the component
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!token || !loggedInEmployee) {
      navigate("/login");
      return;
    }

    const fetchTasks = async () => {
      try {
        const userTasks = await apiRequest(
          `${apiUrl}/api/tasks`,
          "GET",
          token
        );
        setTasks(userTasks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate, token, loggedInEmployee, apiUrl]);

  const updateTaskState = (updatedTask) => {
    setTasks((currentTasks) =>
      currentTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  const handleModalSubmit = async () => {
    const { mode, task } = modalState;
    if (!task) return;

    const body =
      mode === "update" ? { description: modalText } : { hasIssue: true };

    try {
      // CORRECTED ENDPOINT
      const updatedTask = await apiRequest(
        `${apiUrl}/api/tasks/${task._id}`,
        "PUT",
        token,
        body
      );
      updateTaskState(updatedTask);
      if (mode === "raiseIssue")
        console.log(`Issue raised for task ${task._id}:`, modalText);
    } catch (err) {
      console.error(`Failed to ${mode} task:`, err);
      setError(`Failed to ${mode} task. Please try again.`);
    } finally {
      closeModal();
    }
  };

  const handleSetStatus = async (taskId, status) => {
    try {
      // CORRECTED ENDPOINT
      const updatedTask = await apiRequest(
        `${apiUrl}/api/tasks/${taskId}`,
        "PUT",
        token,
        { status, hasIssue: status === "Done" ? false : undefined }
      );
      updateTaskState(updatedTask);
    } catch (err)      {
      console.error("Failed to update status:", err);
    }
  };

  const handleResolveIssue = async (taskId) => {
    try {
      const updatedTask = await apiRequest(
        `${apiUrl}/api/tasks/${taskId}`,
        "PUT",
        token,
        { hasIssue: false }
      );
      updateTaskState(updatedTask);
    } catch (err) {
      console.error("Failed to resolve issue:", err);
    }
  };

  const openModal = (task, mode) => {
    setModalState({ isOpen: true, mode, task });
    setModalText(mode === "update" ? task.description : "");
  };

  const closeModal = () =>
    setModalState({ isOpen: false, mode: null, task: null });

  const handleLogout = () => {
    apiRequest(`${apiUrl}/api/auth/logout`, "POST", token).catch(
      console.error
    );
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const cardActions = { openModal, handleSetStatus, handleResolveIssue };
  const filteredTasks = tasks.filter((task) =>
    filter === "Active" ? task.status !== "Done" : task.status === "Done"
  );

  if (!loggedInEmployee) return null;

  return (
    <div
      className="min-h-screen font-sans text-white/90 bg-slate-900"
      style={{
        backgroundImage: `radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.1) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.1) 0px, transparent 50%)`,
      }}
    >
      <header className="sticky top-0 z-40 bg-slate-900/50 backdrop-blur-md border-b border-slate-700/60">
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Task Dashboard
          </h1>
          <motion.div
            className="relative"
            onHoverStart={() => setIsProfileOpen(true)}
            onHoverEnd={() => setIsProfileOpen(false)}
          >
            <img
              src={loggedInEmployee.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
            <AnimatePresence>
              {isProfileOpen && (
                <ProfileDropdown
                  employee={loggedInEmployee}
                  onLogout={handleLogout}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-16 pt-8">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Welcome back, {loggedInEmployee.name}.
          </h2>
          <p className="text-white/40 text-sm mt-2">
            {currentTime.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            | {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="mb-10 flex items-center justify-center gap-2 p-1 bg-slate-800/60 backdrop-blur-sm rounded-xl max-w-xs mx-auto">
          {["Active", "Completed"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setFilter(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "w-full py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300",
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
        <AnimatePresence>
          {loading ? (
            <motion.div key="loader" className="text-center text-white/50">
              Loading tasks...
            </motion.div>
          ) : error ? (
            <motion.div key="error" className="text-center text-red-400">
              {error}
            </motion.div>
          ) : filteredTasks.length > 0 ? (
            <motion.div layout className="space-y-8">
              {filteredTasks.map((task) => (
                <TaskCard key={task._id} task={task} actions={cardActions} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-slate-800/30 rounded-2xl"
            >
              <h3 className="text-2xl font-bold">All Clear!</h3>
              <p className="text-white/60 mt-2">
                You have no {filter.toLowerCase()} tasks.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Modal
        {...{
          modalState,
          closeModal,
          modalText,
          setModalText,
          handleModalSubmit,
        }}
      />
    </div>
  );
};

// --- Child Components ---

const ProfileDropdown = ({ employee, onLogout }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -10 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="absolute top-full right-0 mt-2 w-56 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
  >
    <div className="p-4 border-b border-slate-700">
      <p className="font-bold text-white">{employee.name}</p>
    </div>
    <div className="p-2">
      <motion.button
        whileHover={{ backgroundColor: "rgba(71, 85, 105, 0.5)" }}
        onClick={onLogout}
        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
      >
        <FiLogOut /> Logout
      </motion.button>
    </div>
  </motion.div>
);

const TaskCard = ({ task, actions }) => {
  const priorityConfig = {
    High: { icon: <FiFlag />, color: "text-red-400" },
    Medium: { icon: <FiFlag />, color: "text-yellow-400" },
    Low: { icon: <FiFlag />, color: "text-sky-400" },
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{
        y: -8,
        rotateX: 3,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="rounded-2xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60 shadow-lg"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-extrabold text-white text-xl">{task.title}</h3>
            {task.hasIssue && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-1 rounded-md"
              >
                <FiAlertOctagon size={14} />
                <span>Issue Raised</span>
              </motion.div>
            )}
          </div>
          <span
            className={clsx(
              "flex-shrink-0 flex items-center gap-2 text-sm font-semibold",
              priorityConfig[task.priority].color
            )}
          >
            <FiFlag /> {task.priority}
          </span>
        </div>
        <p className="text-white/70 leading-relaxed min-h-[40px]">
          {task.description}
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm text-white/50">
          <FiClock size={14} />{" "}
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="border-t border-slate-700/60 bg-slate-800/20 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {task.hasIssue ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => actions.handleResolveIssue(task._id)}
              title="Resolve Issue"
              className="flex items-center gap-2 text-sm text-emerald-400/80 hover:text-emerald-400 bg-slate-700/50 hover:bg-emerald-500/20 py-2 px-3 rounded-lg transition-colors"
            >
              <FiCheckSquare size={16} /> Resolve Issue
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => actions.openModal(task, "raiseIssue")}
              title="Raise Issue"
              className="flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 bg-slate-700/50 hover:bg-red-500/20 py-2 px-3 rounded-lg transition-colors"
            >
              <FiAlertOctagon size={16} />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => actions.openModal(task, "update")}
            title="Update Task"
            className="flex items-center gap-2 text-sm text-sky-400/80 hover:text-sky-400 bg-slate-700/50 hover:bg-sky-500/20 py-2 px-3 rounded-lg transition-colors"
          >
            <FiEdit2 size={16} /> Update
          </motion.button>
        </div>
        {task.status !== "Done" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => actions.handleSetStatus(task._id, "Done")}
            className="text-sm font-semibold bg-slate-700/80 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FiCheck /> Mark as Done
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

const Modal = ({
  modalState,
  closeModal,
  modalText,
  setModalText,
  handleModalSubmit,
}) => {
  const { isOpen, mode, task } = modalState;
  if (!isOpen || !task) return null;
  const modalConfig = {
    update: {
      title: "Update Task Description",
      icon: <FiEdit2 className="text-sky-400" />,
      buttonText: "Save Changes",
    },
    raiseIssue: {
      title: "Raise an Issue",
      icon: <FiAlertOctagon className="text-red-400" />,
      buttonText: "Submit Issue",
    },
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <motion.div
          initial={{ y: -20, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            {modalConfig[mode].icon}{" "}
            <h2 className="text-2xl font-bold">{modalConfig[mode].title}</h2>
          </div>
          <p className="text-sm text-white/50 mb-6">For task: "{task.title}"</p>
          <textarea
            value={modalText}
            onChange={(e) => setModalText(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-base text-white/90 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows="6"
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={closeModal}
              className="text-sm font-semibold text-white/60 hover:text-white bg-slate-700/50 hover:bg-slate-700 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleModalSubmit}
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 py-2 px-4 rounded-lg transition-colors"
            >
              {modalConfig[mode].buttonText}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmployeeDashboard;
