import React, { useEffect, useState } from "react";
import "./tasklist.css";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const TaskList = ({ house_id }) => {
  const [taskDataList, setTaskDataList] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksQuery = query(collection(db, 'tasks'), where('house_id', '==', house_id));
        const tasksSnapshot = await getDocs(tasksQuery);

        const tasksDataList = [];
        for (const taskDoc of tasksSnapshot.docs) {
          const taskData = taskDoc.data();

          // Fetch user data based on assigned_to UID
          const assignedToDocRef = doc(db, 'users', taskData.assigned_to);
          const assignedToDocSnapshot = await getDoc(assignedToDocRef);

          if (assignedToDocSnapshot.exists()) {
            const assignedToUserData = assignedToDocSnapshot.data();
            taskData.assigned_to_displayName = assignedToUserData.displayName;
          }

          tasksDataList.push(taskData);
        }

        setTaskDataList(tasksDataList);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [house_id]);

  return (
    <div className="task-list">
      <h2>Task List</h2>
      <ul>
        {taskDataList.map((task, index) => (
          <li key={index}>
            <strong>Task:</strong> {task.details}, <strong>Assigned To:</strong> {task.assigned_to_displayName}, <strong>Due Time:</strong> {task.due_timeStamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
