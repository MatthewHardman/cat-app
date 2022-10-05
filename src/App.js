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
  const [userName, setUserName] = useState();
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
        setIsLoaded(true);
        allCats = response;
        getMoreCats();
      })
      .catch((err) => {
        console.log(err);
        setIsLoaded(true);
        setView("Error - fetch failed");
      });
  };

  const getMoreCats = () => {
    let tempCatArray = [...catArray];
    numberOfCats = numberOfCats + 3;
    for (let i = catArray.length; i < numberOfCats; i++) {
      let randomIndex = Math.floor(Math.random() * allCats.length);
      let newCat = allCats[randomIndex];
      if (tempCatArray.includes(newCat)) {
        i--;
      } else {
        tempCatArray.push(newCat);
      }
    }
    setCatArray(tempCatArray);
  };

  const saveCat = async (item, event) => {
    if (user) {
      event.currentTarget.style.color = "pink";
      let tempArray = [...savedCats];
      if (tempArray.includes(item)) {
        alert("You've already saved that cat!");
      } else {
        tempArray.push(item);
        console.log(item);
        console.log(tempArray);
        const user = auth.currentUser;
        console.log(user, user.uid);
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          storedCats: tempArray,
        });
        setSavedCats(tempArray);
      }
    } else {
      alert("You must sign in to save cats for later!");
    }
  };

  const firebaseToLocal = async () => {
    if (user) {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      setUserName(user.displayName);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.hasOwnProperty("storedCats")) {
          setSavedCats(userData.storedCats);
          return new Promise((resolve) => {
            resolve("resolved");
          });
        }
      }
    }
  };

  const handleSelect = async (selectedKey) => {
    if (selectedKey === "home") {
      setView("home");
    } else if (selectedKey === "saved") {
      const result = await firebaseToLocal();
      if (result === "resolved") {
        setView("saved");
      } else {
        setView("Error - No Saved Cats");
      }
    }
  };

  const handleDelete = async (item) => {
    let tempArray = [...savedCats];
    let index = tempArray.indexOf(item);
    tempArray.splice(index, 1);
    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      storedCats: tempArray,
    });
    setSavedCats(tempArray);
  };

  useEffect(() => {
    getCats();
  }, []);

  if (!isLoaded) return <div>Loading...</div>;
  else if (view === "home") {
    return (
      <Container>
        <Nav
          justify
          variant="tabs"
          defaultActiveKey="home"
          onSelect={handleSelect}
          style={{
            position: "sticky",
            top: "0",
            zIndex: "1",
            backgroundColor: "white",
          }}
        >
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
                <Button onClick={(event) => saveCat(item, event)}>
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
        <Nav
          justify
          variant="tabs"
          defaultActiveKey="saved"
          onSelect={handleSelect}
          style={{
            position: "sticky",
            top: "0",
            zIndex: "1",
            backgroundColor: "white",
          }}
        >
          <Nav.Item>
            <Nav.Link eventKey="home">Home</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="saved">Saved Cats</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <h4>Welcome, {userName}!</h4>
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
  } else if (view === "Error - No Saved Cats") {
    return (
      <Container>
        <Nav
          justify
          variant="tabs"
          defaultActiveKey="saved"
          onSelect={handleSelect}
        >
          <Nav.Item>
            <Nav.Link eventKey="home">Home</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="saved">Saved Cats</Nav.Link>
          </Nav.Item>
        </Nav>
        <h1>Log in and save some cats first!</h1>
      </Container>
    );
  } else if (view === "Error - fetch failed") {
    return (
      <Container>
        <Nav justify variant="tabs" onSelect={handleSelect}>
          <Nav.Item>
            <Nav.Link eventKey="home" disabled>
              Home
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="saved" disabled>
              Saved Cats
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <h3>
          It appears the website that supplies our cats is down. We're sorry
          about that. Please try again later.
        </h3>
      </Container>
    );
  }
}

export default App;
