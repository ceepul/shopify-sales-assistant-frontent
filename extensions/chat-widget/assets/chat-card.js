import React from 'react';
import ReactDOM from 'react-dom';

// Define your React component
const MyComponent = () => {
    console.log("This ran")
    return <h1>Hello, World!</h1>;
};

ReactDOM.render(<MyComponent />, document.getElementById('chat-container'));
  