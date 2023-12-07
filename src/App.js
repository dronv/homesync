import React, { useState, useEffect } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth';
import {auth} from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import MainScreen from "./components/MainScreen";
import HouseholdMembers from "./components/Householdmembers";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";
import CreateHouseForm from "./components/CreateHouse";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [membersList, setMembersList] = useState([{}]);
  const [tasks, setTasks] = useState([]);
  const [isMemberOfHouse, setIsMemberOfHouse] = useState(false);
  const [houseName, setHouseName] = useState('');
  const [houseId, setHouseId] = useState(null);

  // Your existing useEffect for handling authentication state changes
  useEffect(() => {
    const checkMembership = async () => {
      if (user && user.uid) {
        const housesQuery = query(collection(db, 'houses'), where('members', 'array-contains', user.uid));
        const querySnapshot = await getDocs(housesQuery);
        if (!querySnapshot.empty) {
          const houseData = querySnapshot.docs[0].data();
          setHouseName(houseData.name);
          setHouseId(houseData.house_id); // Update the state here
          console.log("House ID for admin:" + houseData.house_id);
        }
        setIsMemberOfHouse(!querySnapshot.empty);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);

        // Automatically add new users to the 'users' collection
        const userRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // User doesn't exist in the 'users' collection, add them
          await setDoc(userRef, {
            uid: authUser.uid,
            displayName: authUser.displayName,
            email: authUser.email,
            photoURL: authUser.photoURL,
            house_id: null
          });
        }

        // Perform the membership check
        checkMembership();
      } else {
        setUser(null);
        setHouseName(null);
        setHouseId(null);
        setTasks(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        const user = result.user;

        if (user) {
          // Check if the user is new or existing
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            // New user, add to 'users' collection
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              house_id: null
            });
          }

          // Continue with other logic for existing users
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    // Call checkRedirectResult when the component mounts
    checkRedirectResult();
  }, []); // Run this effect only once on mount

  // Updated signInWithGoogle to use signInWithPopup
  const signInWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = userCredential.user;

      // Check if the user is new or existing
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // New user, add to 'users' collection
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          house_id: null
        });
      }

      // Continue with other logic for existing users

    } catch (error) {
      console.error(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };


  return (
    <div className="App">
      {user ? (
        <Router>
          <nav>
            <ul>
              <li className="logo" style={{"color":"#2f2626"}}> 
                <NavLink  disabled="true" to="/">HomeSync</NavLink>
              </li>
              <li>
                <NavLink to="/">Dashboard</NavLink>
              </li>
              <li>
                <NavLink to="/create-house">Create House</NavLink>
              </li>
              <li>
                <NavLink to="/house-members">House Members</NavLink>
              </li>
              <li>
                <NavLink to="/add-task">Add Task</NavLink>
              </li>
              <li>
                <NavLink to="/task-list">Task List</NavLink>
              </li>
              <li>
                <button onClick={logout}>Sign out</button>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route
              path="/"
              element={<MainScreen members={membersList} user={user} houseName={houseName} />}
            />
            <Route path="/create-house" element={<CreateHouseForm user={user} />} />
            <Route
              path="/house-members"
              element={<HouseholdMembers membersList={membersList} house_id={houseId} setMembersList={setMembersList} />}
            />
            <Route
              path="/add-task"
              element={<AddTaskForm house_id={houseId} members={membersList} setTasks={setTasks} />}
            />
            <Route path="/task-list" element={<TaskList house_id={houseId} />} />
          </Routes>
        </Router>
      ) : (
        <div>
          <h1>Welcome to HomeSync</h1>
          <p>Please sign in to continue.</p>
          <button onClick={signInWithGoogle}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
}

export default App;
