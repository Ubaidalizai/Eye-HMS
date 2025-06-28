import React, { useState } from 'react';
import Altrasound from "../components/Altrasound.jsx";
import Bedroom from "../components/Bedroom.jsx";
import Operation from "../components/Operation.jsx";
import Laboratory from "../components/Laboratory.jsx";
import OCT from "../components/OCT.jsx";
import OPD from "../components/OPD.jsx";
import './task.css';

function Branches() {
  const [activeComponent, setActiveComponent] = useState('Bedroom'); // Default component

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Bedroom':
        return <Bedroom />;
      case 'Altrasound':
        return <Altrasound />;
      case 'Operation':
        return <Operation />;
      case 'Laboratory':
        return <Laboratory />;
      case 'OCT':
        return <OCT />;
      case 'OPD':
        return <OPD />;
      default:
        return <Bedroom />;
    }
  };

  return (
    <div>
      <div className='flex space-x-4'>
        <button onClick={() => setActiveComponent('Bedroom')}>Bedroom</button>
        <button onClick={() => setActiveComponent('Altrasound')}>
          Ultrasound
        </button>
        <button onClick={() => setActiveComponent('Operation')}>
          Operation
        </button>
        <button onClick={() => setActiveComponent('Laboratory')}>
          Laboratory
        </button>
        <button onClick={() => setActiveComponent('OCT')}>OCT</button>
        <button onClick={() => setActiveComponent('OPD')}>OPD</button>
      </div>
      {renderComponent()}
    </div>
  );
}

export default Branches;
