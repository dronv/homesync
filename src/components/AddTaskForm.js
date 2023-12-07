import React, { useState } from "react";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import "./addtaskform.css";
import { collection, addDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

const AddTaskForm = ({ members, setTasks, house_id }) => {
  const [details, setDetails] = useState("");
  const [assigned_to, setAssignedTo] = useState("");
  const [assigned_timeStamp, setAssigned_timeStamp] = useState("");
  const [due_timeStamp, setDue_timeStamp] = useState("")

  const handleAddTask = async () => {
    if (details.trim() !== "" && assigned_to !== "") {
      try {
        const tasksRef = collection(db, `tasks`);
        const currentTime = new Intl.DateTimeFormat("en", {
          timeZone: "America/New_York",
          timeStyle: "medium",
          dateStyle: "short",
        });
        try{
        const taskDocRef= await addDoc(tasksRef, {
          details: details,
          assigned_to: assigned_to,
          assigned_timeStamp: currentTime.format(Date.now()),
          due_timeStamp: due_timeStamp,
          house_id : house_id
        });
        const houseRef  = doc(db, 'houses', house_id);
    
          await updateDoc(houseRef, {
            task_list: arrayUnion(taskDocRef.id)
          });
          console.log("Sucessfulyy added task to house table")
        } catch (error) {
          console.error('Error creating house: ', error);
        }
        NotificationManager.success('Task Added', 'Success', 2000);
        setDetails("");
        setAssignedTo("");
        setAssigned_timeStamp("");
        setDue_timeStamp("")
      } catch (error) {
        console.error("Error adding task: ", error.message);
      }
    }
  };
  return (
    <div className="add-task-form">
      <input
        type="text"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Add a new task"
      />
      <select value={assigned_to} onChange={(e) => setAssignedTo(e.target.value)}>
        <option value="" disabled>Select member</option>
        {members.map((member, index) => (
          <option key={index} value={member.uid}>{member.displayName}</option>
        ))}
      </select>
      <input
        type="datetime-local"
        value={due_timeStamp}
        onChange={(e) => setDue_timeStamp(e.target.value)}
      />
      
      <button disabled={(house_id == null? true: false)} onClick={handleAddTask}>Add Task</button>
      <NotificationContainer />
    </div>
  );
};

export default AddTaskForm;
