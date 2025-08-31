import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import HabitTracker from './components/HabitTracker';

function App() {
  return (
    <div className="container mt-4">
      <HabitTracker habitName="Drink Water" />
    </div>
  );
}

export default App;

