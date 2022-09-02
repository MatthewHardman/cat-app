import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useState, useEffect } from "react";

function App() {
  //const [numberOfCats, setNumberOfCats] = useState(6);
  const [catArray, setCatArray] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getCats = () => {
    fetch("https://cataas.com/api/cats?limit=9", { mode: "cors" })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setIsLoaded(true);
        setCatArray(response);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getCats();
  }, []);

  if (!isLoaded) return <div>Loading...</div>;
  else {
    return (
      <Container
        style={{
          border: "2px solid black",
        }}
      >
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
      </Container>
    );
  }
}

export default App;
