import { useState } from "react";
import { Form, Col, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  selectPageLimit,
  setPageLimit,
} from "../../features/project/textSlice";
import { setIdle } from "../../features/project/tokenSlice";
import { selectProject } from "../../features/project/projectSlice";
import { IoCheckmarkCircleSharp, IoCloseCircle } from "react-icons/io5";

const MAPPING = {
  lower_case: "Lower cased",
  remove_duplicates: "Duplicate documents removed",
  digits_iv: "Digits treated as in-vocabulary (IV)",
  chars_removed: "Characters removed from corpus",
};

export const Settings = () => {
  const dispatch = useDispatch();
  const pageLimit = useSelector(selectPageLimit);
  const project = useSelector(selectProject);
  const [tempPageLimit, setTempPageLimit] = useState(10);

  console.log(tempPageLimit);

  return (
    <div>
      <p style={{ fontWeight: "bold" }}>Annotation Settings</p>
      <Form>
        <Form.Group style={{ marginLeft: " 0.25em", width: "10em" }}>
          <Form.Label style={{ fontSize: "0.9em" }}>
            Documents per page
          </Form.Label>
          <Form.Control
            as="select"
            aria-label="Default select example"
            size="sm"
            onChange={(e) => setTempPageLimit(e.target.value)}
          >
            {[10, 20, 30, 40, 50].map((limit) => (
              <option value={limit}>{limit}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button
          size="sm"
          variant="dark"
          style={{ marginLeft: "0.25em", marginBottom: "1em" }}
          onClick={() => {
            dispatch(setPageLimit(Number(tempPageLimit)));
            dispatch(setIdle());
          }}
          disabled={tempPageLimit == pageLimit}
        >
          Apply
        </Button>
      </Form>

      <p style={{ fontWeight: "bold" }}>Project Settings</p>
      {project &&
        Object.keys(project.preprocessing).map((measure) => (
          <div style={{ display: "flex", marginLeft: "0.5em" }}>
            {project.preprocessing[measure] ? (
              <IoCheckmarkCircleSharp
                style={{ color: "rgba(153,191,156,1)" }}
              />
            ) : (
              <IoCloseCircle />
            )}
            <p style={{ fontSize: "0.9em", marginLeft: "0.25em" }}>
              {MAPPING[measure]}
              {measure === "chars_removed" &&
                " (" + project.preprocessing[measure] + ")"}
            </p>
          </div>
        ))}
    </div>
  );
};
