// CreateHouseForm.js

import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, where, getDocs,getDoc, query } from 'firebase/firestore';
import { db } from '../firebase'; 
import "./createhouse.css"

const CreateHouseForm = ({ user }) => {
  const [houseName, setHouseName] = useState('');
  const [isMemberOfHouse, setIsMemberOfHouse] = useState(false);
  const [Message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Check if the user is already a member of any house
    const checkMembership = async () => {
      const housesQuery = query(collection(db, 'houses'), where('members', 'array-contains', user.uid));
      const querySnapshot = await getDocs(housesQuery);

      const isMember = !querySnapshot.empty;
      setIsMemberOfHouse(isMember);
      
      if (isMember) {
        setMessage('You are already a member of a house! Cannot create a new house group.');
        setIsError(true);
      }
    };

    checkMembership();
  }, [user.uid]);

  const handleCreateHouse = async (e) => {
    e.preventDefault();

    if (isMemberOfHouse) {
      return; // Prevent further execution if the user is already a member
    }

    // Create a new house document in the 'houses' collection
    try {
      // ... (rest of your code)
      setMessage('House created successfully, add new members to sync with them.');
    } catch (error) {
      setMessage(`Error creating house: ${error.message}`);
      setIsError(true);
    } finally {
      setIsMemberOfHouse(true);
    }
  };

  return (
    <div className='create-house'>
      <h2>Create a New House</h2>
      <form onSubmit={handleCreateHouse}>
          <input
            type="text"
            value={houseName}
            placeholder='Give your house group a name'
            onChange={(e) => setHouseName(e.target.value)}
            required
          />
        <button className="create-house-btn" type="submit" disabled={isMemberOfHouse}>
          Create House
        </button>
      </form>
      <div style={{ color: isError ? 'red' : 'green' }}>{Message}</div>
    </div>
  );
};

export default CreateHouseForm;
