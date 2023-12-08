import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, query, where, getDocs,arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import './createhouse.css';

const CreateHouseForm = ({ user }) => {
  const [houseName, setHouseName] = useState('');
  const [isMemberOfHouse, setIsMemberOfHouse] = useState(false);
  const [Message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
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

    if (houseName.trim() !== "") {
      const housesRef = collection(db, 'houses');

      try {
        const houseDocRef = await addDoc(housesRef, {
          admin: user.uid,
          members: arrayUnion(user.uid),
          name: houseName,
        });

        await updateDoc(houseDocRef, {
          house_id: houseDocRef.id,
        });

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          house_id: houseDocRef.id,
        });

        NotificationManager.success('House created successfully', 'Success');
        setMessage('House created successfully, add new members to sync with them');
      } catch (error) {
        NotificationManager.error(`Error creating house: ${error.message}`, 'Error');
        setMessage(`Error creating house: ${error.message}`);
        setIsError(true);
      } finally {
        setIsMemberOfHouse(true);
      }
    } else {
      NotificationManager.error('Please provide a valid house name', 'Error');
    }
  };

  return (
    <div className="create-house">
      <h2>Create a New House</h2>
      <form onSubmit={handleCreateHouse}>
        <input
          type="text"
          value={houseName}
          placeholder="Give your house group a name"
          onChange={(e) => setHouseName(e.target.value)}
          required
        />
        <button className="create-house-btn" type="submit" disabled={isMemberOfHouse}>
          Create House
        </button>
      </form>
      <div style={{ color: isError ? 'red' : 'green' }}>{Message}</div>
      <NotificationContainer />
    </div>
  );
};

export default CreateHouseForm;
