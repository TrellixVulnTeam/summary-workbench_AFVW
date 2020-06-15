import React, { useContext, useEffect, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import { FaCloud, FaTrash } from "react-icons/fa";

import {
  deleteCalculationRequest,
  getSavedCalculationsRequest,
} from "../common/api";
import { SettingsContext } from "../contexts/SettingsContext";
import { SavedInfo } from "./SavedInfo";

const Saved = ({ className }) => {
  const [open, setOpen] = useState(true);
  const [calculations, setCalculations] = useState([]);
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    getSavedCalculationsRequest()
      .then((response) => response.json())
      .then((data) => setCalculations(data));
  }, []);

  const deleteCalculation = (name) => {
    deleteCalculationRequest(name)
      .then((response) => {
        if (response.status === 404) {
          alert("Resource not found");
        }
        window.location.reload();
      })
      .catch(() => alert("server not available"));
  };

  if (calculations.length > 0) {
    return (
      <Card className={className ? className : ""}>
        <Card.Body>
          <Button variant="info" onClick={() => setOpen(!open)}>
            <FaCloud /> saved calculations{" "}
            <Badge variant="light" pill>
              {calculations.length}
            </Badge>
          </Button>
          <Collapse in={open}>
            <Accordion className="mt-4">
              {calculations.map(([name, scores]) => (
                <Card key={name}>
                  <Card.Header className="d-flex justify-content-between">
                    <div className="d-md-flex flex-grow-1 justify-content-between">
                      <Accordion.Toggle
                        as={Button}
                        variant="link"
                        eventKey={name}
                      >
                        {name}
                      </Accordion.Toggle>
                      <div>
                        {Object.entries(settings).map(
                          ([metric, metricInfo]) => (
                            <Badge
                              key={metric}
                              className="mx-1 my-2 mb-1"
                              variant={
                                Object.keys(scores).includes(metric)
                                  ? "primary"
                                  : "secondary"
                              }
                              pill
                            >
                              {metricInfo.readable}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <Button
                      className="ml-3 align-self-start"
                      variant="danger"
                      onClick={() => deleteCalculation(name)}
                    >
                      <FaTrash />
                    </Button>
                  </Card.Header>
                  <Accordion.Collapse eventKey={name}>
                    <Card.Body>
                      <SavedInfo name={name} scoreInfo={scores} />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              ))}
            </Accordion>
          </Collapse>
        </Card.Body>
      </Card>
    );
  } else {
    return null;
  }
};

export { Saved };
