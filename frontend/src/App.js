import { useState } from 'react';

const App = () => { 
  const [error, setError] = useState("");
  const [value, setValue] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [parentQuestionId, setParentQuestionId] = useState(null);  // Track the parent question ID

  const surpriseOptions = [
    "When won the latest Nobel Peace Prize?",
    "Where does pizza come from?",
    "How do you make a BLT sandwich?"
  ];

  const surprise = () => {
    const random = Math.floor(Math.random() * surpriseOptions.length);
    setValue(surpriseOptions[random]);
  }

  const getResponse = async () => {
    if (!value) {
      setError("Please enter a question");
      return;
    }

    try {
      console.log(`Parent question ID before asking question: ${parentQuestionId}`);
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          history: chatHistory,
          message: value,
          parentQuestionId: parentQuestionId  // Send the parent question ID in the request
        })
      };

      const response = await fetch("http://localhost:5000/gemini", options);
      const data = await response.json();  // Parse JSON response from server

      console.log(data);

      setChatHistory(oldChatHistory => [
        ...oldChatHistory, 
        { 
          role: "user",
          parts: [{ text: value }]
        },
        {
          role: "model",
          parts: [{ text: data.answer }]
        }
      ]);

      // If a match is found, store the returned _id to use as parentQuestionId for next questions
      if (data._id) {
        setParentQuestionId(data._id);
        console.log(`Parent question ID: ${data._id}`);
      }

      setValue("");  // Clear the input field

    } catch (error) {
      console.log(error);
    }
  };

  const clear = () => {
    setError("");
    setValue("");
    setChatHistory([]);
    setParentQuestionId(null);  // Reset parentQuestionId
  }

  return (
    <div className="app">
      <div>
        <p>What do you want to know?
          <button className="surprise" onClick={surprise} disabled={!chatHistory}>Surprise me</button>
        </p>
        <div className="input-container">
          <input 
            value={value}
            placeholder="When is Christmas?" 
            onChange={(e) => setValue(e.target.value)}
          />
          {!error && <button onClick={getResponse}>Ask Me</button>}
          {error && <button onClickCapture={clear}>Clear</button>}
        </div>
        {error && <p>{error}</p>} 
        <div className="search-result">
          {chatHistory.map((chatItem, _index) => (
            <div key={_index}>
              {chatItem.role === "user" && <p className="user">{chatItem.parts[0].text}</p>}
              {chatItem.role === "model" && <p className="model">{chatItem.parts[0].text}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
