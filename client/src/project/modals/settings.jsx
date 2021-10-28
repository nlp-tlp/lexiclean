import { Form } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";

import {
  selectPageLimit,
  setPageLimit,
} from "../../features/project/textSlice";

import {
  setIdle
} from "../../features/project/tokenSlice"

export const Settings = () => {
  const dispatch = useDispatch();
  const pageLimit = useSelector(selectPageLimit);

  return (
    <div>
      <p>Documents per page: {pageLimit}</p>
      <Form>
        <Form.Group controlId="formBasicRange">
          <Form.Control
            type="range"
            value={pageLimit}
            onChange={(e) => {
              dispatch(setPageLimit(Number(e.target.value)));
              dispatch(setIdle());
            }}
            step={10}
            min={10}
            max={50}
            tooltipLabel={(currentValue) => `${currentValue}`}
            tooltip="on"
          />
        </Form.Group>
      </Form>
    </div>
  );
};
