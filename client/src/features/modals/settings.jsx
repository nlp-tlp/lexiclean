import { useState } from "react";
import history from "../utils/history";
import { Form, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  selectPageLimit,
  setPageLimit,
} from "../../features/project/textSlice";
import { setIdle } from "../../features/project/tokenSlice";
import { selectProject } from "../../features/project/projectSlice";
import { IoCheckmarkCircleSharp, IoCloseCircle } from "react-icons/io5";
import { useParams } from "react-router";

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
  const [tempPageLimit, setTempPageLimit] = useState(1);
  const { pageNumber } = useParams();

  console.log(pageLimit, tempPageLimit)

  return (
    <div>
      <p style={{ fontWeight: "bold", padding: "0", margin: "0" }}>
        Annotation Settings
      </p>
      <p style={{ fontSize: "0.75rem" }}>
        <strong>Tip:</strong> If you have a large project, use smaller page
        sizes to improve latency.
      </p>
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
            {[1, 2, 5, 10, 20, 30, 40, 50].map((limit) => (
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
            if (Number(pageNumber) === 1) {
              dispatch(setIdle());
            } else {
              history.push(`/project/${project._id}/page/1`);
            }
          }}
          disabled={Number(tempPageLimit) === Number(pageLimit)}
        >
          Apply
        </Button>
      </Form>

      <p style={{ fontWeight: "bold" }}>Project Preprocessing Operations</p>
      {project &&
        Object.keys(project.preprocessing).map((measure) => (
          <div style={{ display: "flex", marginLeft: "0.5em" }}>
            {project.preprocessing[measure] ? (
              <IoCheckmarkCircleSharp style={{ color: "#1b5e20" }} />
            ) : (
              <IoCloseCircle style={{ color: "#f44336" }} />
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
