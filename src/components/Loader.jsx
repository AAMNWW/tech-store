import React, { useEffect, useState } from 'react';

function Loader() {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), 1800);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className={`loader-screen ${hiding ? 'hiding' : ''}`}>
      <div className="loader-content">
        <div className="loader-logo">TechStore</div>
        <div className="loader-bar">
          <div className="loader-progress" />
        </div>
      </div>
    </div>
  );
}

export default Loader;