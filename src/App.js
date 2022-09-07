import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useState, useEffect } from "react";

let allCats = [];
let numberOfCats = 0;

function App() {
  const [catArray, setCatArray] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    getCats();
  }, []);

  if (!isLoaded) return <div>Loading...</div>;
  else {
    return (
      <Container fluid="true">
        <Row xs={1} sm={2} md={3}>
          {catArray.map((item) => (
            <Col key={item.id}>
              <Card>
                <Card.Img
                  variant="top"
                  src={"https://cataas.com/cat/" + item.id}
                />
                <Button>Test Button</Button>
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
  }
}

export default App;
