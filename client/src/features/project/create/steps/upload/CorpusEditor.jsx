import { useDispatch, useSelector } from "react-redux";
import {
  setStepData,
  selectSteps,
  selectActiveStep,
} from "../../createStepSlice";

export const CorpusEditor = ({ corpus }) => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);

  if (steps[activeStep].data.corpusHasIds) {
    return (
      <textarea
        className="preview-container-editable"
        value={
          corpus &&
          Object.keys(corpus)
            .map((id) => `${id}: ${corpus[id]}`)
            .join("\n")
        }
        key="corpus-input"
        wrap="off"
        disabled
      />
    );
  } else {
    return (
      <textarea
        className="preview-container-editable"
        placeholder="Paste or upload corpus (.txt format)"
        onChange={(e) =>
          dispatch(
            setStepData({
              corpus: Object.assign(
                {},
                ...e.target.value
                  .split("\n")
                  .map((text, index) => ({ [index]: text }))
              ),
              corpusFileName: null,
            })
          )
        }
        value={
          corpus &&
          Object.keys(corpus)
            .map((id) => corpus[id])
            .join("\n")
        }
        key="corpus-input"
        wrap="off"
      />
    );
  }
};
