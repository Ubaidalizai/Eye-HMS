import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "Doctor and Professor of Eyes and ...",
    profilePic:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
  });

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/user/profile",
          { withCredentials: true }
        );
        if (response.status === 200) {
          const { firstName, lastName, email, imageUrl } = response.data.data;
          setUser({
            ...user,
            firstName,
            lastName,
            email,
            profilePic: `http://localhost:4000/public/img/users/${imageUrl}`,
          });
        } else {
          console.error("Failed to fetch user profile", response);
        }
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prevUser) => ({ ...prevUser, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    alert("Profile updated!");
  };

  return (
    <div className='col-span-12 lg:col-span-10 p-4 md:p-6 lg:p-8'>
      <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-center'>
        Your Profile
      </h1>
      <div className='bg-white shadow-md rounded-lg p-4 md:p-6 lg:p-8'>
        <div className='flex flex-col items-center mb-4'>
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt='Profile'
              onClick={handleProfilePicClick}
              className='w-24 h-24 rounded-full object-cover mb-4 cursor-pointer'
            />
          ) : (
            <div
              onClick={handleProfilePicClick}
              className='w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center cursor-pointer'
            >
              <span className='text-gray-400'>No Image</span>
            </div>
          )}
          <input
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>

        {isEditing ? (
          <>
            <input
              type='text'
              name='firstName'
              value={user.firstName}
              onChange={handleChange}
              className='w-full p-2 border border-gray-300 rounded mb-4 text-center'
              placeholder='Enter your first name'
            />

            <input
              type='text'
              name='lastName'
              value={user.lastName}
              onChange={handleChange}
              className='w-full p-2 border border-gray-300 rounded mb-4 text-center'
              placeholder='Enter your last name'
            />

            <p className='text-gray-600 mb-4 text-center'>
              Email: {user.email}
            </p>

            <textarea
              name='bio'
              value={user.bio}
              onChange={handleChange}
              rows='4'
              className='w-full p-2 border border-gray-300 rounded mb-4 text-center'
              placeholder='Update your bio'
            />

            <button
              onClick={handleSaveChanges}
              className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'
            >
              Save Changes
            </button>
          </>
        ) : (
          <>
            <h2 className='text-xl md:text-2xl font-semibold mb-2 text-center'>
              {user.firstName} {user.lastName}
            </h2>

            <p className='text-gray-600 mb-4 text-center'>
              Email: {user.email}
            </p>

            <p className='text-gray-600 mb-4 text-center'>{user.bio}</p>

            <button
              onClick={toggleEdit}
              className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
