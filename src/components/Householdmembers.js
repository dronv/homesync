import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { db } from "../firebase"; 
import "./householdmembers.css";

const HouseholdMembers = ({ membersList, setMembersList, house_id }) => {
  const [newMember, setNewMember] = useState("");
  const [error, setError] = useState("");
  const [listFetched, setListFetched] = useState(false);
  const [memberExists, setMemberExists] = useState(false)
  useEffect(() => {
    if(house_id != null){
    const fetchMembersList = async () => {
      const membersListQuery = query(collection(db, 'users'), where('house_id', '==', house_id));
      const membersSnapshot = await getDocs(membersListQuery);
      const fetchedMembersList = membersSnapshot.docs.map((doc) => doc.data());
      setMembersList(fetchedMembersList);
      setListFetched(true);
    };

    fetchMembersList();
  }
  else {
    setError("You are not a member of any house! Create a house or join other house group.");
  }
  }, [house_id, listFetched, setMembersList]);
  
  const handleAddMember = async () => {
    if (house_id == null) {
      return;
    }
  
    const userQuery = query(collection(db, 'users'), where('email', '==', newMember));
    const userSnapshot = await getDocs(userQuery);
  
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const newMemberId = userDoc.id;
  
      // Check if the user is already a member of the current house
      if (!membersList.some(member => member.id === newMemberId)) {
        const houseDocRef = doc(db, 'houses', house_id);
        await updateDoc(houseDocRef, {
          members: arrayUnion(newMemberId),
        });
  
        const userDocRef = doc(db, 'users', newMemberId);
        await updateDoc(userDocRef, {
          house_id: house_id,
        });
  
        // Update the local state with the new member
        setMembersList((prevMembersList) => [
          ...prevMembersList,
          {
            id: newMemberId,
            task_assigned: null,
            ...userDoc.data(),
          },
        ]);
  
        setNewMember("");
        setError("");
      } else {
        setError("User is already a member of the house");
      }
    } else {
      setError("User does not exist");
    }
  };
  
  

  return (
    <div className="household-members-container">
      <h2 className="household-members-title">Household Members</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="add-member-form">
        <input
          type="text"
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          placeholder="Add a new member"
          className="add-member-input"
        />
        <button onClick={handleAddMember} className="add-member-button">Add Member</button>
      </div>
      <ul className="household-members-list">
        {membersList.map((member, index) => (
          <li key={index} className="household-member-item">{member.displayName}</li>
        ))}
      </ul>
    </div>
  );
};

export default HouseholdMembers;