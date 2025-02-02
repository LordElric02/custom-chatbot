import  { useState } from 'react';


const App = () => { 
  const [error, setError] = useState("");
  const[value, setValue] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const surpriseOptions = [
    "When won the latest Nobel Peae Prize?",
    "When does Pizzz come from?",
    "How do you make a BLT sandwich?"
  ];

  const surprise = () => {
    const random = Math.floor(Math.random() * surpriseOptions.length);
    setValue(surpriseOptions[random]);
  }

  const getResponse = async () => {
    if(!value) {
      setError("Please enter a question");
      return;
    }

    try {
      
      const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            history: chatHistory,
            message: value
          })
      };
      const response = await fetch("http://localhost:5000/gemini  ", options);
      const data = await response.text();
      console.log(data);
      setChatHistory(oldChatHistory => [
        ...oldChatHistory, 
        { 
            role: "user",
            parts: [{ text: value }]
        },
        {
            role: "model",
            parts: [{ text: data }]
        }
    ]);
       setValue("");

    } catch (error) {
      console.log(error);
    }
  };

  const clear = () => {
    setError("");
    setValue("");
    setChatHistory([]);
  }

  return (
    <div className="app">
        <div className="app">
          <p>What do you wanto to know?
            <button className="surprise" onClick={surprise} disabled={!chatHistory}>Surprise me</button>
          </p>
          <div className="input-container">
            <input 
              value={value}
               placeholder="When is christmas?" 
               onChange={(e) => setValue(e.target.value)}
            />
            {!error &&<button onClick={getResponse}>Ask Me</button>}
            {error &&<button onClickCapture={clear}>Clear</button>}
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
  )
}

export default App;
