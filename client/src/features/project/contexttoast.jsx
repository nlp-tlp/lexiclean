import React from "react";
import { Toast } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { selectShowToast, selectToastInfo, setShowToast } from "./tokenSlice";

export const ContextToast = () => {
  const dispatch = useDispatch();
  const toastInfo = useSelector(selectToastInfo);
  const showToast = useSelector(selectShowToast);
  const toastAvailable = Object.keys(toastInfo).length > 0;

  const header = (info) => {
    return (
      <div>
        <strong className="mr-auto">
          {info.type.includes("replacement") && "Replacement"}
          {info.type.includes("meta") && "Meta Tag"}
          {info.type.includes("suggestion") && "Suggestion"}
        </strong>
        <small style={{ marginLeft: "0.25em" }}>just now</small>
      </div>
    );
  };

  const replacementView = (info) => {
    return (
      <div>
        {info.type.includes("remove")
          ? "Removed replacement from: "
          : "Original: "}
        <strong>{info.content.original}</strong> <br />
        {info.type.includes("add") && (
          <>
            Replacement: <strong>{info.content.replacement}</strong>
            <br />
          </>
        )}
        {info.type.includes("all") && (
          <>
            Count: <strong>{info.content.count}</strong>
          </>
        )}
      </div>
    );
  };

  const metaView = (info) => {
    return (
      <div>
        Token: <strong>{info.content.original}</strong> <br />
        Tag: <strong>{info.content.metaTag}</strong> <br />
        Bool: <strong>
          {info.content.metaTagValue ? "true" : "false"}
        </strong>{" "}
        <br />
        {info.type.includes("all") && (
          <>
            Count: <strong>{info.content.count}</strong>
          </>
        )}
      </div>
    );
  };

  const suggestionView = (info) => {
    return (
      <div>
        {info.type.includes("remove")
          ? "Removed suggestion from: "
          : "Original: "}{" "}
        <strong>{info.content.original}</strong> <br />
        {info.type.includes("add") && (
          <>
            Replacement: <strong>{info.content.replacement}</strong>
            <br />
          </>
        )}
        {info.type.includes("all") && (
          <>
            Count: <strong>{info.content.count}</strong>
          </>
        )}
      </div>
    );
  };

  return (
    <Toast
      show={showToast}
      onClose={() => dispatch(setShowToast(false))}
      style={{
        position: "fixed",
        top: 90,
        right: 20,
        width: 200,
        zIndex: 1000,
      }}
      delay={5000}
      autohide
    >
      <Toast.Header>{toastAvailable && header(toastInfo)}</Toast.Header>
      <Toast.Body>
        {toastAvailable &&
          toastInfo.type.includes("replacement") &&
          replacementView(toastInfo)}
        {toastAvailable &&
          toastInfo.type.includes("meta") &&
          metaView(toastInfo)}
        {toastAvailable &&
          toastInfo.type.includes("suggestion") &&
          suggestionView(toastInfo)}
      </Toast.Body>
    </Toast>
  );
};
