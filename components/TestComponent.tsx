'use client';

import React, { useState } from 'react';

export function TestComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Test Component</h1>
      <p>Count: {count}</p>
      <button
        className="bg-blue-500 text-white p-2 rounded mt-2"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
}