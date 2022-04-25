import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import UserProfile from "./pages/UserProfile/UserProfile"

function App() {
  const [isAuth, setIsAuth] = useState(false);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserProfile/>}/>
      </Routes>
    </Router>
  );
}

export default App;
