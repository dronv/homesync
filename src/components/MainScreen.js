import React, { useState } from 'react';
import "./mainscreen.css"; // Import the stylesheet

const MainScreen = ({ user, houseName }) => {
  return (
    <div className="main-screen">
      <h1 className='title'>Household Management</h1>
      <h2 className='greetings'>Hello, {user.displayName}</h2>
      <img alt='profile' className='user-profile-photo'src={user.photoURL} />
      <p>Your house: <strong>{houseName}</strong></p>
    </div>
  );
};

export default MainScreen;
