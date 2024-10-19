import React, { useState } from 'react';
import Altrasound from '../components/Altrasound';
import Bedroom from '../components/Bedroom';
import Operation from '../components/Operation';

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
      </div>
      {renderComponent()}
    </div>
  );
}

export default Branches;
