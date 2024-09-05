import React from "react";
import { useSelector } from "react-redux";

const Pharmacy = () => {
  const movedItems = useSelector((state) => state.inventory.movedItems);

  return (
    <div className="p-16">
      <h2 className="text-2xl font-bold mb-6">Pharmacy</h2>
      <ul>
        {movedItems.length > 0 ? (
          movedItems.map((item, index) => (
            <li key={index}>
              {item.name} (Quantity: {item.quantity})
            </li>
          ))
        ) : (
          <li>No items moved to pharmacy.</li>
        )}
      </ul>
    </div>
  );
};

export default Pharmacy;
