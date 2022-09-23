import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import Nav from "react-bootstrap/Nav";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
//import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAMqfTFmnj2eRMT3KLItVBiyy0xHCsP2Cg",
  authDomain: "aileenscatapp.firebaseapp.com",
  projectId: "aileenscatapp",
  storageBucket: "aileenscatapp.appspot.com",
  messagingSenderId: "676137092790",
  appId: "1:676137092790:web:c15df8e3e79cec1f468817",
  measurementId: "G-RRV0Y6VLX6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let allCats = [];
let numberOfCats = 0;

function App() {
  const [user] = useAuthState(auth);
  const [catArray, setCatArray] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [savedCats, setSavedCats] = useState([]);
  const [view, setView] = useState("home");

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log(user);
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    console.log(q);
    if (docs.docs.length === 0) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
      });
    }
  };

  const getCats = () => {
    fetch("https://cataas.com/api/cats", { mode: "cors" })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setIsLoaded(true);
        allCats = response;
        getMoreCats();
      })

      .catch((err) => console.log(err));
  };

  const getMoreCats = () => {
    let tempCatArray = [...catArray];
    numberOfCats = numberOfCats + 3;
    for (let i = catArray.length; i < numberOfCats; i++) {
      let randomIndex = Math.floor(Math.random() * allCats.length);
      tempCatArray.push(allCats[randomIndex]);
    }
    setCatArray(tempCatArray);
  };

  const saveCat = async (item) => {
    let tempArray = [...savedCats];
    if (tempArray.includes(item)) {
      alert("You've already saved that cat!");
    } else {
      tempArray.push(item.id);
      console.log(item);
      console.log(tempArray);
      const user = auth.currentUser;
      console.log(user, user.uid);
      const userRef = doc(db, "users", user.uid);
      //const userRef = await getDoc(docRef);
      //console.log(userRef.data());
      await updateDoc(userRef, {
        storedCats: item.id,
      });

      setSavedCats(tempArray);
    }
  };

  const handleSelect = (selectedKey) => {
    if (selectedKey === "home") {
      setView("home");
    } else if (selectedKey === "saved") {
      setView("saved");
    }
  };

  const handleDelete = (item) => {
    let tempArray = [...savedCats];
    let index = tempArray.indexOf(item);
    tempArray.splice(index, 1);
    setSavedCats(tempArray);
  };

  useEffect(() => {
    getCats();
  }, []);

  if (!isLoaded) return <div>Loading...</div>;
  else if (view === "home") {
    return (
      <Container>
        <Nav variant="tabs" defaultActiveKey="home" onSelect={handleSelect}>
          <Nav.Item>
            <Nav.Link eventKey="home">Home</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="saved">Saved Cats</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            {user ? (
              <Button onClick={() => signOut(auth)}>Sign Out</Button>
            ) : (
              <Button onClick={signInWithGoogle}>Sign In</Button>
            )}
          </Nav.Item>
        </Nav>
        <Row xs={1} sm={2} md={3}>
          {catArray.map((item) => (
            <Col key={item.id}>
              <Card>
                <Card.Img
                  variant="top"
                  src={"https://cataas.com/cat/" + item.id}
                />
                <Button onClick={() => saveCat(item)}>
                  <FontAwesomeIcon icon={faHeart} />
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
        <Button
          variant="secondary"
          style={{ width: "100%" }}
          onClick={getMoreCats}
        >
          See More Cats
        </Button>
      </Container>
    );
  } else if (view === "saved") {
    return (
      <Container>
        <Nav variant="tabs" defaultActiveKey="home" onSelect={handleSelect}>
          <Nav.Item>
            <Nav.Link eventKey="home">Home</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="saved">Saved Cats</Nav.Link>
          </Nav.Item>
        </Nav>
        <Row xs={1} sm={2} md={3}>
          {savedCats.map((item) => (
            <Col key={item.id}>
              <Card>
                <Card.Img
                  variant="top"
                  src={"https://cataas.com/cat/" + item.id}
                />
                <Button variant="danger" onClick={() => handleDelete(item)}>
                  Delete
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }
}

export default App;
