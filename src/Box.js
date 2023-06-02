import React, { useState, useEffect } from "react";

export default function Box(props) {
  const [transientColor, setTransientColor] = useState("transparent");

  useEffect(() => {
    if (!props.on) {
      //setTransientColor("#FFFAFA");
      setTransientColor("black");
      setTimeout(() => {
        setTransientColor("transparent");
      }, 100);
    } else {
      setTransientColor("#05D5FA");
    }
  }, [props.on]);

  const styles = {
    backgroundColor: props.on ? "#05D5FA" : transientColor,
  };

  return (
    <div
      style={styles}s
      className="box"
      onClick={() => props.toggle(props.id)}
    ></div>
  );
}
