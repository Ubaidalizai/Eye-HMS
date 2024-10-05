import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState({
    id: "", // Add user ID here
    firstName: "",
    lastName: "",
    email: "",
    bio: "Doctor and Professor of Eyes and ...",
    profilePic:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png", // Default profile image
  });

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/user/profile",
        { withCredentials: true }
      );
      if (response.status === 200) {
        const { _id, firstName, lastName, email, imageUrl } =
          response.data.data;
        setUser((prevUser) => ({
          ...prevUser,
          id: _id, // Set user ID here
          firstName,
          lastName,
          email,
          profilePic: imageUrl
            ? `http://localhost:4000/public/img/users/${imageUrl}`
            : prevUser.profilePic,
        }));
      } else {
        console.error("Failed to fetch user profile", response);
      }
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
  };

  useEffect(() => {
    fetchUserData(); // Call the fetch function on mount
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
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
    setIsEditing((prev) => !prev);
  };

  const handleSaveChanges = async () => {
    setIsEditing(false);

    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/user/updateCurrentUserProfile`,
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Profile updated successfully!");
        // Refresh user data to get the latest data
        fetchUserData();
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className='col-span-12 lg:col-span-10 p-4 md:p-6 lg:p-8'>
      <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-center'>
        Your Profile
      </h1>
      <div className='bg-white shadow-md rounded-lg p-4 md:p-6 lg:p-8'>
        <div className='flex flex-col items-center mb-4'>
          <img
            src={user.profilePic}
            alt='Profile'
            onClick={handleProfilePicClick}
            className='w-24 h-24 rounded-full object-cover mb-4 cursor-pointer'
          />
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
