import { useEffect, useRef } from "react";

// Copied from https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
export function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Copied from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
// export function useInterval(callback, delay) {
//   const savedCallback = useRef();

//   // Remember the latest callback.
//   useEffect(() => {
//     savedCallback.current = callback;
//   }, [callback]);

//   // Set up the interval.
//   useEffect(() => {
//     function tick() {
//       savedCallback.current();
//     }
//     if (delay !== null) {
//       let id = setInterval(tick, delay);
//       return () => clearInterval(id);
//     }
//   }, [delay]);
// }
export function useInterval(callback, delay) {
  const savedCallback = useRef();
  const requestRef = useRef();
  const previousTimeRef = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const animate = (time) => {
      if (
        previousTimeRef.current === undefined ||
        time - previousTimeRef.current >= delay
      ) {
        savedCallback.current();
        previousTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [delay]);
}
